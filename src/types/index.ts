// ================================================================
// MataData — Core Type Definitions
// ================================================================

// ---- User ----
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  constituency: string | null;
  preferences: {
    language: Language;
    notifications: boolean;
  };
  onboardingComplete: boolean;
  createdAt: string;
  // Legacy / optional
  isGuest?: boolean;
  language?: Language;
  pincode?: string;
  constituencyId?: string;
}

// ---- Language ----
export type Language = 'en' | 'hi';

// ---- Constituency ----
export interface Constituency {
  id: string;
  name: string;
  state: string;
  electionType: 'lok_sabha' | 'vidhan_sabha' | 'municipal';
  pincodeRanges: string[];
  district?: string;
  reservation?: 'SC' | 'ST' | 'General' | 'OBC';
}

// ---- Candidate ----
export interface Candidate {
  id: string;
  constituencyId: string;
  name: string;
  party: string;
  electionYear: number;
  assetsCr?: number;
  liabilitiesCr?: number;
  casesCount: number;
  cases?: CriminalCase[];
  attendancePct?: number;
  termsServed: number;
  education?: string;
  age?: number;
  sourceEci?: string;
  sourcePrs?: string;
  sourceMyneta?: string;
  lastUpdated: string;
}

export interface CriminalCase {
  caseNumber: string;
  section: string;
  court: string;
  status: 'pending' | 'convicted' | 'acquitted';
  description?: string;
}

// ---- Chat ----
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: string;
  isStreaming?: boolean;
  isCached?: boolean;
}

export interface Source {
  name: string;
  url?: string;
  type: 'eci' | 'prs' | 'myneta' | 'constitution' | 'tavily';
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  constituencyId?: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

// ---- RAG ----
export interface DocumentChunk {
  id: string;
  content: string;
  source: string;
  sourceUrl?: string;
  title?: string;
  chunkIndex?: number;
  similarity?: number;
}

export interface CacheHit {
  id: string;
  response: string;
  sources: Source[];
  similarity: number;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

// ---- Notifications ----
export type NotificationType =
  | 'election_reminder'
  | 'deadline_alert'
  | 'candidate_update'
  | 'rights_tip'
  | 'booth_info'
  | 'system'
  | 'verification';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// ---- Voice ----
export type VoiceMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'push-to-talk';

// ---- Onboarding ----
export type OnboardingStep = 'hook' | 'feature' | 'voice' | 'setup';

// ---- Query Classification ----
export type QueryType = 'rights' | 'candidate' | 'process' | 'booth' | 'date' | 'general';

// ---- API Responses ----
export interface ApiError {
  error: string;
  code: string;
}

export interface ConstituencyLookupResponse {
  constituency: Constituency | null;
  candidates?: Candidate[];
}

// ---- Election ----
export interface Election {
  name: string;
  date: string;
  type: 'lok_sabha' | 'vidhan_sabha' | 'municipal';
  state?: string;
}
