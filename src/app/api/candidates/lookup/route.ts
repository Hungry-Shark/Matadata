import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── MyNeta constituency ID map (top constituencies per state) ────
// We map district names (from India Post pincode lookup) to MyNeta IDs.
// This is a curated list — expand as needed.
const DISTRICT_TO_CONSTITUENCY: Record<string, { id: string; name: string; state: string }[]> = {
  // Uttar Pradesh
  'varanasi':     [{ id: '530', name: 'VARANASI', state: 'UTTAR PRADESH' }],
  'lucknow':      [{ id: '490', name: 'LUCKNOW', state: 'UTTAR PRADESH' }],
  'prayagraj':    [{ id: '522', name: 'PHULPUR', state: 'UTTAR PRADESH' }, { id: '523', name: 'ALLAHABAD', state: 'UTTAR PRADESH' }],
  'kanpur':       [{ id: '493', name: 'KANPUR', state: 'UTTAR PRADESH' }],
  'agra':         [{ id: '456', name: 'AGRA', state: 'UTTAR PRADESH' }],
  'noida':        [{ id: '449', name: 'GAUTAM BUDDHA NAGAR', state: 'UTTAR PRADESH' }],
  'ghaziabad':    [{ id: '448', name: 'GHAZIABAD', state: 'UTTAR PRADESH' }],
  'meerut':       [{ id: '445', name: 'MEERUT', state: 'UTTAR PRADESH' }],
  'gorakhpur':    [{ id: '531', name: 'GORAKHPUR', state: 'UTTAR PRADESH' }],
  'mathura':      [{ id: '457', name: 'MATHURA', state: 'UTTAR PRADESH' }],
  'ayodhya':      [{ id: '507', name: 'FAIZABAD', state: 'UTTAR PRADESH' }],
  'rae bareli':   [{ id: '500', name: 'RAE BARELI', state: 'UTTAR PRADESH' }],
  'amethi':       [{ id: '501', name: 'AMETHI', state: 'UTTAR PRADESH' }],
  // Delhi
  'new delhi':    [{ id: '106', name: 'NEW DELHI', state: 'NCT OF DELHI' }],
  'central delhi':[{ id: '103', name: 'CHANDNI CHOWK', state: 'NCT OF DELHI' }],
  'south delhi':  [{ id: '107', name: 'SOUTH DELHI', state: 'NCT OF DELHI' }],
  'east delhi':   [{ id: '105', name: 'EAST DELHI', state: 'NCT OF DELHI' }],
  'north delhi':  [{ id: '102', name: 'NORTH WEST DELHI', state: 'NCT OF DELHI' }],
  'west delhi':   [{ id: '104', name: 'WEST DELHI', state: 'NCT OF DELHI' }],
  'north east delhi': [{ id: '101', name: 'NORTH EAST DELHI', state: 'NCT OF DELHI' }],
  // Maharashtra
  'mumbai':       [{ id: '309', name: 'MUMBAI SOUTH', state: 'MAHARASHTRA' }, { id: '310', name: 'MUMBAI SOUTH CENTRAL', state: 'MAHARASHTRA' }],
  'pune':         [{ id: '299', name: 'PUNE', state: 'MAHARASHTRA' }],
  'nagpur':       [{ id: '275', name: 'NAGPUR', state: 'MAHARASHTRA' }],
  'thane':        [{ id: '307', name: 'THANE', state: 'MAHARASHTRA' }],
  // Karnataka
  'bengaluru':    [{ id: '186', name: 'BANGALORE SOUTH', state: 'KARNATAKA' }, { id: '185', name: 'BANGALORE NORTH', state: 'KARNATAKA' }],
  'bangalore':    [{ id: '186', name: 'BANGALORE SOUTH', state: 'KARNATAKA' }],
  'mysuru':       [{ id: '188', name: 'MYSORE', state: 'KARNATAKA' }],
  // Tamil Nadu
  'chennai':      [{ id: '384', name: 'CHENNAI CENTRAL', state: 'TAMIL NADU' }, { id: '383', name: 'CHENNAI NORTH', state: 'TAMIL NADU' }],
  'coimbatore':   [{ id: '393', name: 'COIMBATORE', state: 'TAMIL NADU' }],
  'madurai':      [{ id: '396', name: 'MADURAI', state: 'TAMIL NADU' }],
  // Telangana
  'hyderabad':    [{ id: '431', name: 'HYDERABAD', state: 'TELANGANA' }],
  'secunderabad': [{ id: '430', name: 'SECUNDERABAD', state: 'TELANGANA' }],
  // West Bengal
  'kolkata':      [{ id: '362', name: 'KOLKATA UTTAR', state: 'WEST BENGAL' }, { id: '363', name: 'KOLKATA DAKSHIN', state: 'WEST BENGAL' }],
  // Gujarat
  'ahmedabad':    [{ id: '117', name: 'AHMEDABAD EAST', state: 'GUJARAT' }, { id: '118', name: 'AHMEDABAD WEST', state: 'GUJARAT' }],
  'surat':        [{ id: '127', name: 'SURAT', state: 'GUJARAT' }],
  // Rajasthan
  'jaipur':       [{ id: '254', name: 'JAIPUR', state: 'RAJASTHAN' }],
  'jodhpur':      [{ id: '260', name: 'JODHPUR', state: 'RAJASTHAN' }],
  // Bihar
  'patna':        [{ id: '80', name: 'PATNA SAHIB', state: 'BIHAR' }],
  // Kerala
  'thiruvananthapuram': [{ id: '225', name: 'THIRUVANANTHAPURAM', state: 'KERALA' }],
  'kochi':        [{ id: '231', name: 'ERNAKULAM', state: 'KERALA' }],
  // Madhya Pradesh
  'bhopal':       [{ id: '136', name: 'BHOPAL', state: 'MADHYA PRADESH' }],
  'indore':       [{ id: '143', name: 'INDORE', state: 'MADHYA PRADESH' }],
  // Assam
  'guwahati':     [{ id: '43', name: 'GUWAHATI', state: 'ASSAM' }],
  // Punjab
  'amritsar':     [{ id: '234', name: 'AMRITSAR', state: 'PUNJAB' }],
  'ludhiana':     [{ id: '238', name: 'LUDHIANA', state: 'PUNJAB' }],
};

interface CandidateData {
  name: string;
  party: string;
  constituency: string;
  state: string;
  isWinner: boolean;
  age?: string;
  education?: string;
  profession?: string;
  totalAssets?: string;
  totalLiabilities?: string;
  criminalCases?: number;
  seriousCases?: number;
  caseDetails?: string;
  mynetaId: string;
  mynetaUrl: string;
}

// ─── Respectful HTML Fetcher ─────────────────────────────────────
async function fetchHTML(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'MataData-CivicAI/1.0 (civic education; non-commercial)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(10000), // 10s timeout
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.text();
}

// ─── Gemini HTML → Candidate JSON ────────────────────────────────
async function extractCandidateFromHTML(html: string, mynetaId: string): Promise<CandidateData | null> {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 12000);

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Extract candidate information from this MyNeta.info HTML.
Return ONLY valid JSON:
{
  "name": "Full Name",
  "party": "Party abbreviation (BJP, INC, SP, AAP, BSP, TMC, etc.)",
  "constituency": "CONSTITUENCY NAME",
  "state": "STATE NAME",
  "isWinner": true/false,
  "age": "Age or null",
  "education": "Education or null",
  "profession": "Profession or null",
  "totalAssets": "Assets (e.g. '₹12.5 Cr') or null",
  "totalLiabilities": "Liabilities or null",
  "criminalCases": number or 0,
  "seriousCases": number or 0,
  "caseDetails": "Brief case summary or null"
}
If a field is not found, set null or 0. Do NOT make up data.

HTML:
${cleaned}` }]
      }],
    });

    const text = result.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as CandidateData;
    parsed.mynetaId = mynetaId;
    parsed.mynetaUrl = `https://myneta.info/LokSabha2024/candidate.php?candidate_id=${mynetaId}`;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Get Candidate IDs from Constituency Page ────────────────────
async function getConstituencyCandidateIds(constituencyId: string): Promise<string[]> {
  const url = `https://myneta.info/LokSabha2024/index.php?action=show_candidates&constituency_id=${constituencyId}`;
  const html = await fetchHTML(url);
  const regex = /candidate_id=(\d+)/g;
  const ids = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids);
}

// ─── Embed and store to vector knowledge graph ──────────────────
async function embedAndStore(content: string, metadata: Record<string, unknown>): Promise<void> {
  try {
    const embedResult = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: content,
      config: { outputDimensionality: 768 },
    });

    const embedding = embedResult.embeddings?.[0]?.values ?? [];
    if (embedding.length === 0) return;

    await adminDb.collection('knowledge').add({
      content,
      ...metadata,
      embedding: FieldValue.vector(embedding),
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn('Embed/store failed:', (err as Error).message);
  }
}

// ─── Build text summary for vector embedding ────────────────────
function candidateToText(c: CandidateData): string {
  let text = `Candidate: ${c.name}\nParty: ${c.party}\nConstituency: ${c.constituency}, ${c.state}\n`;
  if (c.isWinner) text += `Status: Won the 2024 Lok Sabha election\n`;
  if (c.age) text += `Age: ${c.age}\n`;
  if (c.education) text += `Education: ${c.education}\n`;
  if (c.profession) text += `Profession: ${c.profession}\n`;
  if (c.totalAssets) text += `Total Declared Assets: ${c.totalAssets}\n`;
  if (c.totalLiabilities) text += `Total Liabilities: ${c.totalLiabilities}\n`;
  if (c.criminalCases && c.criminalCases > 0) {
    text += `Criminal Cases: ${c.criminalCases} pending`;
    if (c.seriousCases) text += ` (${c.seriousCases} serious)`;
    text += '\n';
    if (c.caseDetails) text += `Case Details: ${c.caseDetails}\n`;
  } else {
    text += `Criminal Cases: None (clean record)\n`;
  }
  text += `\nSource: MyNeta.info (ADR affidavit data) — ${c.mynetaUrl}`;
  return text;
}

/**
 * GET /api/candidates/lookup?district=Varanasi&state=Uttar Pradesh
 * 
 * On-demand candidate lookup:
 * 1. Check Firestore cache for this constituency
 * 2. If cache miss → scrape MyNeta live, extract with Gemini, cache + vectorize
 * 3. Return candidates
 * 
 * Cache TTL: 7 days (election data doesn't change often)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const district = url.searchParams.get('district')?.toLowerCase().trim();
    const state = url.searchParams.get('state')?.trim();

    if (!district) {
      return NextResponse.json({ error: 'district parameter required' }, { status: 400 });
    }

    // 1. Look up constituency IDs for this district
    const constituencies = DISTRICT_TO_CONSTITUENCY[district];
    if (!constituencies || constituencies.length === 0) {
      // Try partial match
      const partialMatch = Object.entries(DISTRICT_TO_CONSTITUENCY).find(([key]) => 
        district.includes(key) || key.includes(district)
      );
      if (!partialMatch) {
        return NextResponse.json({
          candidates: [],
          message: `No constituency mapping found for district "${district}". We're expanding coverage.`,
          supported_districts: Object.keys(DISTRICT_TO_CONSTITUENCY).sort(),
        });
      }
      // Use partial match
      return await fetchAndReturnCandidates(partialMatch[1], state);
    }

    return await fetchAndReturnCandidates(constituencies, state);
  } catch (error) {
    console.error('Candidate lookup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function fetchAndReturnCandidates(
  constituencies: { id: string; name: string; state: string }[],
  _state?: string | null
) {
  const allCandidates: (CandidateData & { id: string })[] = [];
  const scrapePromises: Promise<void>[] = [];

  for (const constituency of constituencies) {
    // 2. Check Firestore cache first
    const cached = await adminDb.collection('candidates')
      .where('constituency', '==', constituency.name)
      .limit(20)
      .get();

    if (!cached.empty) {
      // Check if cache is fresh (< 7 days)
      const firstDoc = cached.docs[0].data();
      const updatedAt = firstDoc.updatedAt?.toDate?.();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (updatedAt && updatedAt > sevenDaysAgo) {
        // Cache hit — return cached data
        cached.docs.forEach(doc => {
          allCandidates.push({ id: doc.id, ...doc.data() } as CandidateData & { id: string });
        });
        continue;
      }
    }

    // 3. Cache miss → scrape live from MyNeta
    scrapePromises.push(
      (async () => {
        try {
          console.log(`[Lookup] Scraping constituency ${constituency.name} (ID: ${constituency.id})`);
          const candidateIds = await getConstituencyCandidateIds(constituency.id);
          
          for (const candId of candidateIds) {
            try {
              // Respectful delay between requests
              await new Promise(r => setTimeout(r, 800));
              const html = await fetchHTML(
                `https://myneta.info/LokSabha2024/candidate.php?candidate_id=${candId}`
              );
              const candidate = await extractCandidateFromHTML(html, candId);

              if (candidate) {
                const docId = `myneta_${candId}`;
                // Store in candidates collection (cache)
                await adminDb.collection('candidates').doc(docId).set({
                  ...candidate,
                  updatedAt: FieldValue.serverTimestamp(),
                }, { merge: true });

                // Store as vector in knowledge collection
                const text = candidateToText(candidate);
                await embedAndStore(text, {
                  sourceName: `${candidate.name} — ${candidate.party} — ${candidate.constituency}`,
                  sourceType: 'myneta',
                  sourceUrl: candidate.mynetaUrl,
                  candidateId: candId,
                  constituency: candidate.constituency,
                  state: candidate.state,
                  party: candidate.party,
                  dataType: 'candidate_affidavit',
                });

                allCandidates.push({ id: docId, ...candidate });
              }
            } catch (err) {
              console.warn(`[Lookup] Failed candidate ${candId}:`, (err as Error).message);
            }
          }
        } catch (err) {
          console.warn(`[Lookup] Failed constituency ${constituency.id}:`, (err as Error).message);
        }
      })()
    );
  }

  // Wait for any scraping to complete
  await Promise.all(scrapePromises);

  return NextResponse.json({
    candidates: allCandidates,
    total: allCandidates.length,
    cached: scrapePromises.length === 0,
  });
}
