import type { Language } from '@/types';

const T = {
  en: {
    // ── Nav ────────────────────────────────────────────────────────────────
    nav: {
      home: 'Home',
      chat: 'Chat',
      candidates: 'Candidates',
      rights: 'Rights',
    },

    // ── Home ───────────────────────────────────────────────────────────────
    home: {
      greeting: (name: string) => `Hey, ${name}! 🗳️`,
      upcoming: 'UPCOMING',
      electionTitle: 'General Elections 2026',
      daysLeft: 'DAYS LEFT',
      askAi: 'Ask AI',
      askAiSub: 'Get instant answers',
      voiceAsk: 'Voice Ask',
      voiceAskSub: 'Speak your query',
      myRights: 'My Rights',
      myRightsSub: 'Know your power',
      findBooth: 'Find Booth',
      findBoothSub: 'Locate your center',
      didYouKnow: 'Did You Know?',
    },

    // ── Chat ───────────────────────────────────────────────────────────────
    chat: {
      title: 'Ask MataData',
      placeholder: 'Ask about candidates, rights, elections…',
      suggestions: [
        'How do I check if my name is on the voter list?',
        'What documents do I need to vote?',
        'What is NOTA and how does it work?',
        'How do I find my polling booth?',
      ],
      thinking: 'Thinking…',
      errorMsg: 'Something went wrong. Please try again.',
    },

    // ── Voice ──────────────────────────────────────────────────────────────
    voice: {
      idle: 'Tap to speak',
      listening: 'Listening…',
      thinking: 'Thinking…',
      speaking: 'Speaking',
      tapHint: 'Tap the mic to ask anything about elections',
      end: 'End Session',
    },

    // ── Rights ─────────────────────────────────────────────────────────────
    rights: {
      title: 'Voter Rights',
      subtitle: 'Understand your constitutional rights and protections as an Indian voter.',
      searchPlaceholder: 'Search rights, articles, or topics…',
      categories: ['All', 'Fundamental', 'Electoral', 'Protections', 'RTI'],
      askAi: 'Ask AI to explain this',
    },

    // ── Booth ──────────────────────────────────────────────────────────────
    booth: {
      title: 'Find Your Booth',
      subtitle: 'Locate your nearest polling center',
      pincodeLabel: 'Enter Pincode',
      pincodeHint: 'Your 6-digit area pincode',
      searchBtn: 'Find Booth',
      gpsBtn: 'Use My Location',
      notFoundTitle: 'No Results Found',
      notFoundSub: 'Try a different pincode or use GPS.',
      openMaps: 'Open in Maps',
    },

    // ── Auth ───────────────────────────────────────────────────────────────
    auth: {
      title: 'Join MataData',
      subtitle: 'Sign in to get personalised election information for your constituency.',
      googleBtn: 'Continue with Google',
    },
  },

  // ── Hindi ───────────────────────────────────────────────────────────────
  hi: {
    nav: {
      home: 'होम',
      chat: 'चैट',
      candidates: 'उम्मीदवार',
      rights: 'अधिकार',
    },

    home: {
      greeting: (name: string) => `नमस्ते, ${name}! 🗳️`,
      upcoming: 'आगामी',
      electionTitle: 'सामान्य चुनाव 2026',
      daysLeft: 'दिन शेष',
      askAi: 'AI से पूछें',
      askAiSub: 'तुरंत जवाब पाएं',
      voiceAsk: 'बोलकर पूछें',
      voiceAskSub: 'अपना सवाल बोलें',
      myRights: 'मेरे अधिकार',
      myRightsSub: 'अपनी शक्ति जानें',
      findBooth: 'बूथ खोजें',
      findBoothSub: 'अपना केंद्र खोजें',
      didYouKnow: 'क्या आप जानते हैं?',
    },

    chat: {
      title: 'MataData से पूछें',
      placeholder: 'उम्मीदवार, अधिकार, चुनाव के बारे में पूछें…',
      suggestions: [
        'मेरा नाम मतदाता सूची में है या नहीं, कैसे जांचें?',
        'मतदान के लिए कौन से दस्तावेज़ चाहिए?',
        'NOTA क्या है और यह कैसे काम करता है?',
        'अपना मतदान केंद्र कैसे खोजें?',
      ],
      thinking: 'सोच रहा हूँ…',
      errorMsg: 'कुछ गलत हुआ। कृपया दोबारा कोशिश करें।',
    },

    voice: {
      idle: 'बोलने के लिए टैप करें',
      listening: 'सुन रहा हूँ…',
      thinking: 'सोच रहा हूँ…',
      speaking: 'बोल रहा हूँ',
      tapHint: 'चुनाव के बारे में कुछ भी पूछने के लिए माइक टैप करें',
      end: 'सत्र समाप्त करें',
    },

    rights: {
      title: 'मतदाता अधिकार',
      subtitle: 'एक भारतीय मतदाता के रूप में अपने संवैधानिक अधिकारों को समझें।',
      searchPlaceholder: 'अधिकार, अनुच्छेद या विषय खोजें…',
      categories: ['सभी', 'मौलिक', 'निर्वाचन', 'संरक्षण', 'RTI'],
      askAi: 'AI से समझाने के लिए कहें',
    },

    booth: {
      title: 'अपना बूथ खोजें',
      subtitle: 'अपना नज़दीकी मतदान केंद्र खोजें',
      pincodeLabel: 'पिन कोड दर्ज करें',
      pincodeHint: 'आपका 6 अंकों का क्षेत्र पिन कोड',
      searchBtn: 'बूथ खोजें',
      gpsBtn: 'मेरा स्थान उपयोग करें',
      notFoundTitle: 'कोई परिणाम नहीं मिला',
      notFoundSub: 'अलग पिन कोड आज़माएं या GPS का उपयोग करें।',
      openMaps: 'मैप में खोलें',
    },

    auth: {
      title: 'MataData में शामिल हों',
      subtitle: 'अपने क्षेत्र की चुनाव जानकारी पाने के लिए साइन इन करें।',
      googleBtn: 'Google से जारी रखें',
    },
  },
} as const;

export type Translations = (typeof T)['en'];

/**
 * @deprecated Use `useTranslations()` from 'next-intl' instead.
 * This file is kept only for backward compatibility during migration.
 */
export function getT(lang: Language): Translations {
  const translations = T as Record<string, unknown>;
  return (translations[lang] ?? T.en) as unknown as Translations;
}
