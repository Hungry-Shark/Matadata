import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/user/profile
 * Body: { uid, name, email, photoURL, constituency, language }
 * Upserts user profile in Firestore under users/{uid}
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, ...data } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    await adminDb.collection('users').doc(uid).set(
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true } // Don't overwrite fields not provided
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

/**
 * GET /api/user/profile?uid=xxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const doc = await adminDb.collection('users').doc(uid).get();
    if (!doc.exists) return NextResponse.json({ profile: null });

    return NextResponse.json({ profile: doc.data() });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
