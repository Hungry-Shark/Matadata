import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/candidates?constituency=VARANASI&state=UTTAR%20PRADESH
 *   → returns all candidates for a constituency from Firestore
 *
 * GET /api/candidates?id=myneta_8974
 *   → returns a single candidate by doc ID
 *
 * GET /api/candidates
 *   → returns all candidates (limit 50)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const constituency = url.searchParams.get('constituency');
    const state = url.searchParams.get('state');
    const party = url.searchParams.get('party');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    // Single candidate lookup
    if (id) {
      const doc = await adminDb.collection('candidates').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }
      return NextResponse.json({ candidate: { id: doc.id, ...doc.data() } });
    }

    // Query candidates
    let query: FirebaseFirestore.Query = adminDb.collection('candidates');

    if (constituency) {
      query = query.where('constituency', '==', constituency.toUpperCase());
    }
    if (state) {
      query = query.where('state', '==', state.toUpperCase());
    }
    if (party) {
      query = query.where('party', '==', party.toUpperCase());
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      candidates,
      total: candidates.length,
    });
  } catch (error) {
    console.error('Candidates API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
