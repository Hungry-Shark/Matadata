import { GoogleGenAI } from '@google/genai';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_DATA = [
  {
    content: "The Model Code of Conduct (MCC) is a set of guidelines issued by the Election Commission of India for conduct of political parties and candidates during elections mainly with respect to speeches, polling day, polling booths, election manifestos, processions and general conduct. It comes into force immediately on announcement of the election schedule.",
    sourceName: "Election Commission of India",
    sourceType: "eci",
    sourceUrl: "https://eci.gov.in"
  },
  {
    content: "Article 326 of the Constitution of India provides that the elections to the House of the People and to the Legislative Assembly of every State shall be on the basis of adult suffrage; that is to say, every person who is a citizen of India and who is not less than 18 years of age is entitled to be registered as a voter at any such election.",
    sourceName: "Constitution of India",
    sourceType: "gov",
    sourceUrl: "https://legislative.gov.in/"
  },
  {
    content: "To get a new Voter ID card, a citizen must fill Form 6 online at the National Voter's Service Portal (nvsp.in) or offline. They must provide passport-size photo, age proof, and address proof. Once submitted, a Booth Level Officer (BLO) will visit for verification. The card is usually delivered in 15-30 days.",
    sourceName: "NVSP Guide",
    sourceType: "eci",
    sourceUrl: "https://voters.eci.gov.in/"
  },
  {
    content: "To find your nearest polling booth, you can visit electoralsearch.in and enter your EPIC number (Voter ID number) or search by your details. You can also call the Voter Helpline at 1950 for booth information.",
    sourceName: "Voter Helpline",
    sourceType: "eci",
    sourceUrl: "https://voters.eci.gov.in/"
  },
  {
    content: "Constituency: Chandauli (SC)\nCandidate 1: Mahendra Nath Pandey (BJP) — 2 terms served, ₹4.2 Cr assets, 3 pending criminal cases.\nCandidate 2: Shailendra Kumar (SP) — New candidate, ₹1.8 Cr assets, clean record.\nCandidate 3: Ram Sevak Patel (BSP) — 1 term served, ₹0.9 Cr assets, 1 pending case.",
    sourceName: "ECI Affidavits 2024",
    sourceType: "myneta",
    sourceUrl: "https://myneta.info"
  }
];

async function seed() {
  console.log('Seeding knowledge base...');
  
  for (const item of MOCK_DATA) {
    try {
      console.log(`Embedding: ${item.sourceName}...`);
      const embedResult = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: item.content,
        config: { outputDimensionality: 768 }
      });
      
      const embedding = embedResult.embeddings?.[0]?.values ?? [];
      
      await db.collection('knowledge').add({
        ...item,
        embedding: admin.firestore.FieldValue.vector(embedding),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Saved successfully.`);
    } catch (err) {
      console.error('Failed to embed/save item:', err);
    }
  }
  
  console.log('Knowledge base seeded successfully!');
  process.exit(0);
}

seed();
