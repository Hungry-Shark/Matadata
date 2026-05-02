/**
 * MataData — Real Candidate Data Scraper & Vector Seeder
 * -------------------------------------------------------
 * Legitimate sources:
 *   1. MyNeta.info (ADR/National Election Watch) — Affidavit data
 *   2. PRS Legislative Research — Parliamentary performance
 *
 * Flow:
 *   Scrape HTML → Gemini extracts structured JSON → Embed → Firestore vector store
 *
 * Usage:
 *   npx ts-node --skip-project scripts/scrape_candidates.ts [--state "UTTAR PRADESH"] [--constituency-ids 530,529]
 */

import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ─── Firebase Admin ───────────────────────────────────────────────
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    } as admin.ServiceAccount),
  });
}
const db = getFirestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Types ────────────────────────────────────────────────────────
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
  selfProfession?: string;
  spouseProfession?: string;
  mynetaId: string;
  mynetaUrl: string;
}

interface MPPerformance {
  name: string;
  constituency?: string;
  state?: string;
  party?: string;
  attendance?: string;
  questionsAsked?: number;
  debatesParticipated?: number;
  privateBills?: number;
  prsUrl: string;
}

// ─── HTML Fetcher (with retry + delay to be respectful) ──────────
async function fetchHTML(url: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Respectful delay between requests (1-2 seconds)
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'MataData-CivicAI-Research/1.0 (civic education project; non-commercial)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} for ${url}`);
      }
      return await resp.text();
    } catch (err) {
      console.warn(`  Attempt ${attempt + 1}/${retries} failed for ${url}:`, (err as Error).message);
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 3000)); // back off before retry
    }
  }
  throw new Error('Unreachable');
}

// ─── Gemini HTML → Structured JSON Extractor ─────────────────────
async function extractCandidateFromHTML(html: string, mynetaId: string): Promise<CandidateData | null> {
  // Strip scripts/styles to reduce token count
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 15000); // Limit to 15k chars for Gemini context

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Extract candidate information from this HTML page from MyNeta.info (an Indian election data portal run by ADR).
Return ONLY valid JSON with these fields:
{
  "name": "Full Name",
  "party": "Party abbreviation (e.g. BJP, INC, SP, AAP, BSP, TMC, NCP, DMK, etc.)",
  "constituency": "Constituency Name",
  "state": "State Name",
  "isWinner": true/false,
  "age": "Age in years or null",
  "education": "Highest education level or null",
  "profession": "Self profession or null",
  "totalAssets": "Total movable+immovable assets (e.g. '₹12.5 Cr') or null",
  "totalLiabilities": "Total liabilities or null",
  "criminalCases": number or 0,
  "seriousCases": number or 0,
  "caseDetails": "Brief summary of criminal cases if any, or null",
  "selfProfession": "Self profession text or null",
  "spouseProfession": "Spouse profession text or null"
}

Do NOT make up data. If a field is not found in the HTML, set it to null or 0.

HTML Content:
${cleaned}` }]
      }],
    });

    const text = result.text || '';
    // Extract JSON from response (might be wrapped in ```json blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`  Could not extract JSON for candidate ${mynetaId}`);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as CandidateData;
    parsed.mynetaId = mynetaId;
    parsed.mynetaUrl = `https://myneta.info/LokSabha2024/candidate.php?candidate_id=${mynetaId}`;
    return parsed;
  } catch (err) {
    console.warn(`  Gemini extraction failed for ${mynetaId}:`, (err as Error).message);
    return null;
  }
}

async function extractMPPerformanceFromHTML(html: string, prsSlug: string): Promise<MPPerformance | null> {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 15000);

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Extract MP performance data from this PRS Legislative Research page.
Return ONLY valid JSON:
{
  "name": "Full Name",
  "constituency": "Constituency or null",
  "state": "State or null",
  "party": "Party or null",
  "attendance": "Attendance percentage or null",
  "questionsAsked": number or 0,
  "debatesParticipated": number or 0,
  "privateBills": number or 0
}

Do NOT make up data. If a field is not found, set it to null or 0.

HTML Content:
${cleaned}` }]
      }],
    });

    const text = result.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as MPPerformance;
    parsed.prsUrl = `https://prsindia.org/mptrack/18th-lok-sabha/${prsSlug}`;
    return parsed;
  } catch (err) {
    console.warn(`  PRS extraction failed for ${prsSlug}:`, (err as Error).message);
    return null;
  }
}

// ─── Extract Candidate IDs from Constituency Page ────────────────
async function getConstituencyCandidateIds(constituencyId: string): Promise<string[]> {
  const url = `https://myneta.info/LokSabha2024/index.php?action=show_candidates&constituency_id=${constituencyId}`;
  const html = await fetchHTML(url);

  // Extract candidate_id= from href attributes
  const regex = /candidate_id=(\d+)/g;
  const ids = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.add(match[1]);
  }

  return Array.from(ids);
}

// ─── Vector Embedding + Firestore Storage ────────────────────────
async function embedAndStore(
  content: string,
  metadata: {
    sourceName: string;
    sourceType: string;
    sourceUrl: string;
    candidateId?: string;
    constituency?: string;
    state?: string;
    party?: string;
    dataType: 'candidate_affidavit' | 'mp_performance' | 'civic_knowledge' | 'election_data';
  }
): Promise<void> {
  try {
    const embedResult = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: content,
      config: { outputDimensionality: 768 },
    });

    const embedding = embedResult.embeddings?.[0]?.values ?? [];
    if (embedding.length === 0) {
      console.warn('  Empty embedding, skipping');
      return;
    }

    await db.collection('knowledge').add({
      content,
      ...metadata,
      embedding: FieldValue.vector(embedding),
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`  ✓ Stored: ${metadata.sourceName} [${metadata.dataType}]`);
  } catch (err) {
    console.error(`  ✗ Failed to embed/store:`, (err as Error).message);
  }
}

// ─── Store Candidate as a Firestore document (non-vector) ────────
async function storeCandidateDoc(candidate: CandidateData): Promise<void> {
  const docId = `myneta_${candidate.mynetaId}`;
  await db.collection('candidates').doc(docId).set({
    ...candidate,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

// ─── Build Natural Language Summary for Vector Embedding ─────────
function candidateToText(c: CandidateData, perf?: MPPerformance): string {
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

  if (perf) {
    if (perf.attendance) text += `Parliamentary Attendance: ${perf.attendance}\n`;
    if (perf.questionsAsked) text += `Questions Asked in Parliament: ${perf.questionsAsked}\n`;
    if (perf.debatesParticipated) text += `Debates Participated: ${perf.debatesParticipated}\n`;
    if (perf.privateBills) text += `Private Member Bills Introduced: ${perf.privateBills}\n`;
  }

  text += `\nSource: MyNeta.info (ADR affidavit data) — ${c.mynetaUrl}`;
  if (perf) text += `\nSource: PRS Legislative Research — ${perf.prsUrl}`;

  return text;
}

// ─── Civic Knowledge Corpus (verified constitutional & electoral data) ─────
const CIVIC_KNOWLEDGE = [
  {
    content: `Article 326 of the Constitution of India guarantees universal adult suffrage. Every Indian citizen aged 18 or above has the right to vote regardless of caste, religion, gender, or economic status. This right cannot be denied on any ground except those specified by law (unsound mind, corrupt practices conviction, etc.).`,
    sourceName: 'Constitution of India — Article 326',
    sourceType: 'constitution',
    sourceUrl: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    content: `Article 19(1)(a) of the Constitution guarantees Freedom of Speech and Expression to all citizens. This includes the right to express political opinions, criticize government policies, participate in peaceful protests, and share information about candidates and elections. Reasonable restrictions can be imposed under Article 19(2) on grounds of sovereignty, public order, decency, and morality.`,
    sourceName: 'Constitution of India — Article 19(1)(a)',
    sourceType: 'constitution',
    sourceUrl: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    content: `Article 21 of the Constitution guarantees the Right to Life and Personal Liberty. The Supreme Court has interpreted this broadly to include the right to privacy (including privacy of voting through secret ballot), right to a clean environment, right to livelihood, and right to education. No person can be deprived of their life or personal liberty except according to procedure established by law.`,
    sourceName: 'Constitution of India — Article 21',
    sourceType: 'constitution',
    sourceUrl: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    content: `Article 14 guarantees equality before law and equal protection of laws. Article 15 prohibits discrimination on grounds of religion, race, caste, sex, or place of birth. Article 16 ensures equality of opportunity in matters of public employment. Together, these articles form the foundation of the Right to Equality in India.`,
    sourceName: 'Constitution of India — Articles 14-16',
    sourceType: 'constitution',
    sourceUrl: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    content: `The Right to Information Act (RTI), 2005 empowers citizens to request information from any public authority. Under Section 6, any citizen can file an RTI application with a fee of ₹10. The public authority must respond within 30 days. First appeal lies with the designated appellate authority within the same public body, and second appeal lies with the Central/State Information Commission. This is a powerful tool for electoral transparency.`,
    sourceName: 'RTI Act 2005',
    sourceType: 'legislation',
    sourceUrl: 'https://rti.gov.in/',
  },
  {
    content: `The Model Code of Conduct (MCC) is issued by the Election Commission of India. Key provisions: 1) No party shall indulge in any activity that may aggravate existing differences or create tension. 2) No appeal to caste or communal feelings shall be made. 3) Ministers shall not combine official visits with election work. 4) The ruling party shall not use government machinery for election purposes. 5) No advertisements shall be issued in government media highlighting achievements of the ruling party. The MCC comes into effect from the date of announcement of elections.`,
    sourceName: 'Election Commission of India — Model Code of Conduct',
    sourceType: 'eci',
    sourceUrl: 'https://eci.gov.in/mcc/',
  },
  {
    content: `To register as a voter in India: 1) You must be an Indian citizen. 2) You must be at least 18 years old on January 1 of the year of revision of electoral rolls. 3) You must be a resident of the constituency. 4) Fill Form 6 online at voters.eci.gov.in or offline at your nearest Electoral Registration Office. 5) Attach passport-size photo, age proof (birth certificate, school certificate, or Aadhaar), and address proof. 6) A Booth Level Officer (BLO) will visit for verification. 7) Your name will be added to the electoral roll after verification. You can check your registration status at electoralsearch.eci.gov.in.`,
    sourceName: 'NVSP — Voter Registration Guide',
    sourceType: 'eci',
    sourceUrl: 'https://voters.eci.gov.in/',
  },
  {
    content: `Section 49-O of the Conduct of Elections Rules (now replaced by NOTA): Voters in India have the right to reject all candidates using the "None of the Above" (NOTA) button on the EVM. NOTA was introduced by the Supreme Court in its 2013 judgment in PUCL vs Union of India. While NOTA does not affect the election result (the candidate with most votes still wins), it allows citizens to formally express dissatisfaction with all candidates.`,
    sourceName: 'Supreme Court — NOTA Judgment',
    sourceType: 'judiciary',
    sourceUrl: 'https://main.sci.gov.in/',
  },
  {
    content: `Polling Day Rights: 1) Every voter has a right to vote in secrecy — no one can watch you vote. 2) You can carry voter ID (EPIC), Aadhaar, driving license, PAN card, or passport as identity proof. 3) Paid leave: Under Section 135B of the Representation of the People Act, every employee is entitled to paid leave on polling day. 4) If you are in the queue before the polling station closes, you MUST be allowed to vote. 5) Persons with disabilities are entitled to assistance from a companion of their choice. 6) Pregnant women and elderly voters may be given priority.`,
    sourceName: 'Representation of the People Act — Polling Day Rights',
    sourceType: 'legislation',
    sourceUrl: 'https://legislative.gov.in/actsofparliamentfromtheyear/representation-people-act-1951',
  },
  {
    content: `Election Grievance Redressal: Voters can report violations through: 1) cVIGIL App — A mobile app by ECI to report violations with photo/video evidence. Complaints are resolved within 100 minutes. 2) Voter Helpline 1950 — 24/7 toll-free number for queries and complaints. 3) National Grievance Services Portal — ngsp.in for online complaints. 4) Returning Officer — File complaints at the constituency level. 5) Election Observer — Report to the election observer appointed by ECI.`,
    sourceName: 'ECI — Grievance Redressal Mechanisms',
    sourceType: 'eci',
    sourceUrl: 'https://eci.gov.in/',
  },
  {
    content: `e-EPIC (Electronic Electoral Photo Identity Card) is a digital version of the Voter ID card that can be downloaded from voters.eci.gov.in. It is a secure, portable PDF document with a QR code for verification. Steps to download: 1) Visit voters.eci.gov.in. 2) Login with your registered mobile number. 3) Navigate to Download e-EPIC. 4) Verify your identity with OTP. 5) Download and save the PDF. The e-EPIC is legally valid as voter identification at the polling station.`,
    sourceName: 'ECI — e-EPIC Digital Voter ID',
    sourceType: 'eci',
    sourceUrl: 'https://voters.eci.gov.in/',
  },
  {
    content: `Electoral Bonds Scheme: Electoral bonds are a financial instrument for making donations to political parties. Key facts: 1) Introduced in 2018 by the Government of India. 2) The Supreme Court struck down the scheme as unconstitutional on February 15, 2024, ruling it violated the Right to Information under Article 19(1)(a). 3) The court ordered the State Bank of India to disclose all bond purchase details. 4) Total bonds purchased between 2019-2024: approximately ₹16,518 crore. 5) Data released by the Election Commission is available at eci.gov.in/electoral-bond.`,
    sourceName: 'Supreme Court — Electoral Bonds Judgment 2024',
    sourceType: 'judiciary',
    sourceUrl: 'https://eci.gov.in/electoral-bond',
  },
];

// ─── Main Scraping Pipeline ──────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  let constituencyIds: string[] = [];

  // Parse command-line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--constituency-ids' && args[i + 1]) {
      constituencyIds = args[i + 1].split(',').map(s => s.trim());
      i++;
    }
  }

  // Default: A representative set of major constituencies across India
  if (constituencyIds.length === 0) {
    constituencyIds = [
      '530', // Varanasi, UP
      '490', // Lucknow, UP
      '103', // Chandni Chowk, Delhi
      '106', // New Delhi, Delhi
      '309', // Mumbai South, Maharashtra
      '384', // Chennai Central, TN
      '431', // Hyderabad, Telangana
      '117', // Ahmedabad East, Gujarat
      '80',  // Patna Sahib, Bihar
      '43',  // Guwahati, Assam
      '186', // Bangalore South, Karnataka
      '225', // Thiruvananthapuram, Kerala
    ];
  }

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  MataData — Real Candidate Data Scraping Pipeline   ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log();

  // ─── Phase 1: Seed Civic Knowledge ─────────────────────────────
  console.log('━━━ Phase 1: Seeding Civic Knowledge Corpus ━━━');
  for (const item of CIVIC_KNOWLEDGE) {
    await embedAndStore(item.content, {
      ...item,
      dataType: 'civic_knowledge',
    });
    // Rate-limit Gemini embedding calls
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`  → ${CIVIC_KNOWLEDGE.length} civic knowledge entries seeded\n`);

  // ─── Phase 2: Scrape MyNeta Candidate Data ─────────────────────
  console.log('━━━ Phase 2: Scraping MyNeta Candidate Affidavits ━━━');
  const allCandidates: CandidateData[] = [];

  for (const constId of constituencyIds) {
    console.log(`\n  📍 Constituency ID: ${constId}`);
    try {
      const candidateIds = await getConstituencyCandidateIds(constId);
      console.log(`     Found ${candidateIds.length} candidates`);

      for (const candId of candidateIds) {
        console.log(`     → Scraping candidate ${candId}...`);
        try {
          const html = await fetchHTML(
            `https://myneta.info/LokSabha2024/candidate.php?candidate_id=${candId}`
          );
          const candidate = await extractCandidateFromHTML(html, candId);

          if (candidate) {
            allCandidates.push(candidate);

            // Store structured data in candidates collection
            await storeCandidateDoc(candidate);

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

            console.log(`     ✓ ${candidate.name} (${candidate.party})`);
          }
        } catch (err) {
          console.warn(`     ✗ Failed candidate ${candId}:`, (err as Error).message);
        }

        // Rate limit: respect the source
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (err) {
      console.warn(`  ✗ Failed constituency ${constId}:`, (err as Error).message);
    }
  }

  console.log(`\n  → Total candidates scraped: ${allCandidates.length}`);

  // ─── Phase 3: Scrape PRS Performance Data (winners only) ───────
  console.log('\n━━━ Phase 3: Scraping PRS Legislative Performance ━━━');
  const winners = allCandidates.filter(c => c.isWinner);
  console.log(`  Found ${winners.length} winners to look up on PRS`);

  for (const winner of winners) {
    // Construct PRS slug from name (lowercase, hyphenated)
    const slug = winner.name.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '-');
    const prsUrl = `https://prsindia.org/mptrack/18th-lok-sabha/${slug}`;

    console.log(`  → Looking up ${winner.name} at PRS...`);
    try {
      const html = await fetchHTML(prsUrl);
      const perf = await extractMPPerformanceFromHTML(html, slug);

      if (perf) {
        // Merge performance data into the knowledge vector
        const enrichedText = candidateToText(winner, perf);
        await embedAndStore(enrichedText, {
          sourceName: `${winner.name} — Performance Record — 18th Lok Sabha`,
          sourceType: 'prs',
          sourceUrl: prsUrl,
          candidateId: winner.mynetaId,
          constituency: winner.constituency,
          state: winner.state,
          party: winner.party,
          dataType: 'mp_performance',
        });

        // Also update the candidate doc with performance data
        await db.collection('candidates').doc(`myneta_${winner.mynetaId}`).set({
          attendance: perf.attendance,
          questionsAsked: perf.questionsAsked,
          debatesParticipated: perf.debatesParticipated,
          privateBills: perf.privateBills,
          prsUrl,
        }, { merge: true });

        console.log(`  ✓ ${winner.name}: ${perf.attendance || 'N/A'} attendance`);
      }
    } catch (err) {
      console.warn(`  ✗ PRS lookup failed for ${winner.name}:`, (err as Error).message);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  // ─── Summary ───────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                   SCRAPING COMPLETE                 ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Civic Knowledge Entries:  ${CIVIC_KNOWLEDGE.length.toString().padStart(4)}                    ║`);
  console.log(`║  Candidates Scraped:       ${allCandidates.length.toString().padStart(4)}                    ║`);
  console.log(`║  Winners (PRS enriched):   ${winners.length.toString().padStart(4)}                    ║`);
  console.log(`║  Constituencies Covered:   ${constituencyIds.length.toString().padStart(4)}                    ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
