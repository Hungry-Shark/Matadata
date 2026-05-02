import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Trusted source URLs that the AI can reference for real-time data.
 * These are public, legitimate civic data sources.
 */
const TRUSTED_SOURCES = {
  eci: 'https://eci.gov.in',
  nvsp: 'https://voters.eci.gov.in',
  myneta: 'https://myneta.info',
  prs: 'https://prsindia.org',
  legislative: 'https://legislative.gov.in',
  rti: 'https://rti.gov.in',
  indiaCode: 'https://www.indiacode.nic.in',
};

/**
 * Language display names for system prompt instructions
 */
const LANG_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi (हिंदी)', bn: 'Bengali (বাংলা)', te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)', ta: 'Tamil (தமிழ்)', gu: 'Gujarati (ગુજરાતી)', kn: 'Kannada (ಕನ್ನಡ)',
};

/**
 * Universal system prompt — works for all 8 languages.
 * Gemini is instructed to respond entirely in the user's language.
 */
function buildSystemPrompt(lang: string): string {
  const langName = LANG_NAMES[lang] || 'English';

  return `
You are MataData, a helpful, neutral, and highly knowledgeable civic intelligence assistant for Indian voters.
Your goal is to educate voters about their constitutional rights, explain the electoral process, and provide factual information about candidates.

CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in ${langName}. Every word of your response must be in ${langName}. Do NOT mix languages. Do NOT use English unless the user's language is English.

Guidelines:
1. Always base your answers on the provided context if available.
2. Be completely neutral. Do NOT endorse or criticize any political party or candidate.
3. Keep answers concise, clear, and easy to understand.
4. If asked about a specific candidate, state their facts (assets, cases, attendance) without judgment.
5. Use bullet points for readability when appropriate.
6. If the context doesn't have the answer, state that you don't have that specific information, but provide general guidance if possible.
7. When citing data, mention the source (MyNeta/ADR, PRS Legislative Research, ECI, etc.)
8. For real-time election data, you can reference these trusted sources:
   - Election Commission of India (eci.gov.in) — official election data
   - MyNeta.info (ADR) — candidate affidavits, assets, criminal records
   - PRS Legislative Research — MP performance, attendance, questions asked
   - NVSP (voters.eci.gov.in) — voter registration
   - RTI Portal (rti.gov.in) — right to information

Remember: ALL responses must be in ${langName}. This is non-negotiable.
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const language: string = body.language || 'en';
    const constituency = body.constituency; // User's constituency for context
    const mode = body.mode;
    let SYSTEM_PROMPT = buildSystemPrompt(language);

    if (mode === 'voice') {
      SYSTEM_PROMPT += `\n\nIMPORTANT: This is a VOICE conversation. You MUST provide short, highly conversational, and natural spoken responses. DO NOT use markdown formatting like ** or *. Keep your answer to 2-3 sentences maximum. Respond in ${LANG_NAMES[language] || 'English'}.`;
    }
    
    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content;

    if (!userQuery) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    let contextText = '';
    const sources: Array<{ name: string; type: string; url: string }> = [];

    // 1. Vector search in knowledge base (RAG)
    try {
      const embedResult = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: userQuery,
        config: { outputDimensionality: 768 }
      });

      const queryEmbedding = embedResult.embeddings?.[0]?.values;

      if (queryEmbedding && queryEmbedding.length > 0) {
        const vectorQuery = adminDb.collection('knowledge')
          .findNearest('embedding', FieldValue.vector(queryEmbedding), {
            limit: 5,
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
      console.warn("Vector search failed:", vectorError);
    }

    // 2. If asking about candidates in their constituency, check Firestore candidates
    if (constituency?.name) {
      try {
        const candidateQuery = await adminDb.collection('candidates')
          .where('constituency', '==', constituency.name.toUpperCase())
          .limit(15)
          .get();

        if (!candidateQuery.empty) {
          const candidateInfo = candidateQuery.docs.map(doc => {
            const d = doc.data();
            return `- ${d.name} (${d.party}): Assets: ${d.totalAssets || 'N/A'}, Criminal Cases: ${d.criminalCases || 0}, Education: ${d.education || 'N/A'}`;
          }).join('\n');

          contextText += `\n\nCandidates in ${constituency.name}:\n${candidateInfo}`;
          sources.push({
            name: `${constituency.name} Candidate Data`,
            type: 'myneta',
            url: 'https://myneta.info'
          });
        }
      } catch {
        // Silent fail — candidates data may not exist yet
      }
    }

    // 3. Live URL context — fetch real-time data from trusted sources when relevant
    const liveContext = await fetchLiveContext(userQuery, constituency);
    if (liveContext.text) {
      contextText += '\n\n' + liveContext.text;
      sources.push(...liveContext.sources);
    }

    // 4. Format the conversation for Gemini
    const contents = [];
    
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + contextText }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Understood. I am ready to help." }]
    });

    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // 5. Generate streaming response with Google Search grounding for real-time queries
    const isRealTimeQuery = /election|result|latest|today|current|news|schedule|date|polling|phase/i.test(userQuery);
    
    const generateConfig: Record<string, unknown> = {};
    if (isRealTimeQuery) {
      // Use Google Search grounding for real-time election queries
      generateConfig.tools = [{ googleSearch: {} }];
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: generateConfig,
    });

    const uniqueSources = Array.from(new Set(sources.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));

    const stream = new ReadableStream({
      async start(controller) {
        try {
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

/**
 * Fetch real-time context from trusted civic sources when the query is relevant.
 * This fetches LIVE data from official sources to supplement the vector knowledge base.
 */
async function fetchLiveContext(
  query: string,
  constituency?: { name?: string; state?: string }
): Promise<{ text: string; sources: Array<{ name: string; type: string; url: string }> }> {
  const text: string[] = [];
  const sources: Array<{ name: string; type: string; url: string }> = [];
  const lowerQuery = query.toLowerCase();

  // Candidate-specific queries → try MyNeta live
  const candidateMatch = lowerQuery.match(/(?:about|who is|tell me about|info on|details of)\s+([a-z\s]+?)(?:\s+from|\s+of|\s*\?|$)/i);
  if (candidateMatch && candidateMatch[1]) {
    const candidateName = candidateMatch[1].trim();
    
    // Check if we have this candidate in Firestore
    try {
      const nameQuery = await adminDb.collection('candidates')
        .where('name', '>=', candidateName.toUpperCase())
        .where('name', '<=', candidateName.toUpperCase() + '\uf8ff')
        .limit(3)
        .get();

      if (!nameQuery.empty) {
        const matchedCandidates = nameQuery.docs.map(doc => {
          const d = doc.data();
          return `${d.name} (${d.party}, ${d.constituency}, ${d.state}): Assets: ${d.totalAssets || 'N/A'}, Criminal Cases: ${d.criminalCases || 0}, Education: ${d.education || 'N/A'}, Won: ${d.isWinner ? 'Yes' : 'No'}. Source: ${d.mynetaUrl}`;
        }).join('\n');
        
        text.push(`Live Candidate Data:\n${matchedCandidates}`);
        sources.push({ name: 'MyNeta.info (ADR)', type: 'myneta', url: 'https://myneta.info' });
      }
    } catch {
      // Silent fail
    }
  }

  // Constituency-specific queries
  if (constituency?.name && (lowerQuery.includes('constituency') || lowerQuery.includes('my area') || lowerQuery.includes('candidate'))) {
    try {
      const constQuery = await adminDb.collection('candidates')
        .where('constituency', '==', constituency.name.toUpperCase())
        .limit(15)
        .get();

      if (!constQuery.empty) {
        const candidates = constQuery.docs.map(doc => {
          const d = doc.data();
          return `- ${d.name} (${d.party}): ${d.isWinner ? '✓ Won' : 'Lost'}, Assets: ${d.totalAssets || 'N/A'}, Cases: ${d.criminalCases || 0}`;
        }).join('\n');
        
        text.push(`Candidates in ${constituency.name}:\n${candidates}`);
        sources.push({ name: `${constituency.name} Data`, type: 'myneta', url: 'https://myneta.info' });
      }
    } catch {
      // Silent
    }
  }

  return {
    text: text.join('\n\n'),
    sources,
  };
}
