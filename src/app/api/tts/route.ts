import { NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';

// Check if we have the necessary credentials
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Initialize the TTS client
const client = new textToSpeech.TextToSpeechClient({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

export async function POST(req: Request) {
  try {
    const { text, languageCode = 'en-IN' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Google Cloud TTS configuration
    const request = {
      input: { text },
      voice: { 
        languageCode, 
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content returned from TTS');
    }

    // Return the audio buffer
    return new NextResponse(Buffer.from(response.audioContent as Uint8Array), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Google TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: error.message },
      { status: 500 }
    );
  }
}
