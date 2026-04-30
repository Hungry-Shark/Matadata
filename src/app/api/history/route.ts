import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/history
 * Body: { uid: string, sessionId: string, messages: ChatMessage[], type: 'chat' | 'voice' }
 * Saves a completed conversation to Firestore under users/{uid}/history/{sessionId}
 */
export async function POST(req: Request) {
  try {
    const { uid, sessionId, messages, type } = await req.json();

    if (!uid || !sessionId || !messages) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await adminDb
      .collection('users')
      .doc(uid)
      .collection('history')
      .doc(sessionId)
      .set({
        sessionId,
        type: type || 'chat',
        messages,
        messageCount: messages.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store a preview of the first user message for the history list
        preview: messages.find((m: { role: string }) => m.role === 'user')?.content?.slice(0, 120) || '',
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('History save error:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

/**
 * GET /api/history?uid=xxx
 * Returns the last 20 sessions for a user
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('history')
      .orderBy('updatedAt', 'desc')
      .limit(20)
      .get();

    const sessions = snapshot.docs.map(doc => doc.data());
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
