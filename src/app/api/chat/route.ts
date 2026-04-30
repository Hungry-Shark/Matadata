import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt for the MataData AI assistant
const SYSTEM_PROMPT = `
You are MataData, a helpful, neutral, and highly knowledgeable civic intelligence assistant for Indian voters.
Your goal is to educate voters about their constitutional rights, explain the electoral process, and provide factual information about candidates.

Guidelines:
1. Always base your answers on the provided context if available.
2. Be completely neutral. Do NOT endorse or criticize any political party or candidate.
3. Keep answers concise, clear, and easy to understand.
4. If asked about a specific candidate, state their facts (assets, cases, attendance) without judgment.
5. Use bullet points for readability when appropriate.
6. If the context doesn't have the answer, state that you don't have that specific information, but provide general guidance if possible.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    
    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content;

    if (!userQuery) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    let contextText = '';
    const sources: Array<{ name: string; type: string; url: string }> = [];

    // 1. Embed the user's query
    try {
      const embedResult = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: userQuery,
        config: { outputDimensionality: 768 }
      });

      const queryEmbedding = embedResult.embeddings?.[0]?.values;

      if (queryEmbedding && queryEmbedding.length > 0) {
        // 2. Perform Vector Search in Firestore
        // Note: This requires a vector index on the 'knowledge' collection's 'embedding' field.
        const vectorQuery = adminDb.collection('knowledge')
          .findNearest('embedding', FieldValue.vector(queryEmbedding), {
            limit: 4,
            distanceMeasure: 'COSINE'
          });

        const snapshot = await vectorQuery.get();
        
        const docs: string[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          docs.push(data.content);
          if (data.sourceType && data.sourceName) {
            sources.push({
              name: data.sourceName,
              type: data.sourceType,
              url: data.sourceUrl || ''
            });
          }
        });

        if (docs.length > 0) {
          contextText = "\n\nRelevant Context from Knowledge Base:\n" + docs.join('\n\n');
        }
      }
    } catch (vectorError) {
      console.warn("Vector search failed (likely needs index or data):", vectorError);
      // We gracefully continue without RAG context if it fails
    }

    // 3. Format the conversation for Gemini
    const contents = [];
    
    // Add system instructions + context as the first message
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + contextText }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Understood. I am ready to help." }]
    });

    // Add conversation history
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // 4. Generate streaming response
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    // Deduplicate sources
    const uniqueSources = Array.from(new Set(sources.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));

    // 5. Create a readable stream to return
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // If we have sources, we can send them first in a custom event or prepend them.
          // For simplicity with basic stream parsing, we'll stream just the text.
          // To send sources, we would normally use ai/react data streaming or JSON.
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
        } finally {
          controller.close();
        }
      }
    });

    // We can pass sources in headers since stream is consumed entirely by text
    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Sources': Buffer.from(JSON.stringify(uniqueSources)).toString('base64'),
    });

    return new NextResponse(stream, { headers });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
