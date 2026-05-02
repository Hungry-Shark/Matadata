/**
 * translate.ts — Generates all Indian language JSON files from en.json using Gemini.
 *
 * Usage:
 *   npx tsx scripts/translate.ts          # generates all languages
 *   npx tsx scripts/translate.ts bn ta    # generates only Bengali & Tamil
 *
 * Requires GEMINI_API_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

config({ path: path.resolve(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Target Languages ─────────────────────────────────────────────────────────
const LANGUAGES: Record<string, { name: string; script: string; locale: string }> = {
  bn: { name: 'Bengali',  script: 'Bengali',     locale: 'bn-IN' },
  te: { name: 'Telugu',   script: 'Telugu',      locale: 'te-IN' },
  mr: { name: 'Marathi',  script: 'Devanagari',  locale: 'mr-IN' },
  ta: { name: 'Tamil',    script: 'Tamil',       locale: 'ta-IN' },
  gu: { name: 'Gujarati', script: 'Gujarati',    locale: 'gu-IN' },
  kn: { name: 'Kannada',  script: 'Kannada',     locale: 'kn-IN' },
};

const MESSAGES_DIR = path.resolve(__dirname, '../messages');

async function translateToLanguage(langCode: string, langMeta: typeof LANGUAGES[string], enJson: Record<string, unknown>) {
  const prompt = `You are an expert translator for Indian languages. Translate the following JSON from English to ${langMeta.name} (${langMeta.script} script).

STRICT RULES:
1. Keep ALL JSON keys unchanged — only translate string values.
2. Preserve {variables} inside curly braces exactly as they are (e.g., "{name}", "{distance}").
3. Preserve emojis exactly as they are.
4. Do NOT translate proper nouns: MataData, NOTA, ECI, PRS, Google, GPS, FAQ, RTI, PAN, Aadhaar.
5. This is a civic/election app for Indian voters — use formal but approachable register.
6. Use the ${langMeta.script} script. Do NOT use Latin script or transliteration.
7. Keep \\n (newline characters) exactly as they are.
8. Return ONLY valid JSON. No markdown fences, no explanations.

JSON to translate:
${JSON.stringify(enJson, null, 2)}`;

  console.log(`  🔄 Translating to ${langMeta.name} (${langCode})...`);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  let text = response.text?.trim() || '';
  
  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Validate it's valid JSON
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    console.error(`  ❌ Invalid JSON returned for ${langCode}. Saving raw output for debugging.`);
    fs.writeFileSync(path.join(MESSAGES_DIR, `${langCode}.raw.txt`), text, 'utf-8');
    return null;
  }
}

async function main() {
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error('❌ messages/en.json not found');
    process.exit(1);
  }

  const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  // Allow filtering: `npx tsx scripts/translate.ts bn ta`
  const requestedLangs = process.argv.slice(2);
  const langsToTranslate = requestedLangs.length > 0
    ? Object.entries(LANGUAGES).filter(([code]) => requestedLangs.includes(code))
    : Object.entries(LANGUAGES);

  if (langsToTranslate.length === 0) {
    console.error(`❌ No valid languages found. Available: ${Object.keys(LANGUAGES).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🌐 MataData Translation Generator`);
  console.log(`   Source: en.json (${Object.keys(enJson).length} namespaces)`);
  console.log(`   Targets: ${langsToTranslate.map(([c, m]) => `${m.name} (${c})`).join(', ')}\n`);

  let successCount = 0;

  for (const [code, meta] of langsToTranslate) {
    try {
      const translated = await translateToLanguage(code, meta, enJson);
      if (translated) {
        const outPath = path.join(MESSAGES_DIR, `${code}.json`);
        fs.writeFileSync(outPath, JSON.stringify(translated, null, 2), 'utf-8');
        console.log(`  ✅ ${meta.name} → messages/${code}.json`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Failed to translate ${meta.name}:`, err);
    }
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🏁 Done! ${successCount}/${langsToTranslate.length} languages generated.\n`);
}

main();
