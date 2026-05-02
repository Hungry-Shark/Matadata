'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useTranslations } from 'next-intl';
import type { VoiceMode } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Voice Screen — Fullscreen immersive voice interface.
 * State machine: IDLE → LISTENING → THINKING → SPEAKING → IDLE
 */
export default function VoicePage() {
  const router = useRouter();
  const { language } = useAppStore();
  const t = useTranslations('voice');
  const [voiceState, setVoiceState] = useState<VoiceMode>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState(t('initialResponse'));
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const deepgramConnectionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = useCallback(async (text: string, langCode: string) => {
    // Cancel any existing playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const langMap: Record<string, string> = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', gu: 'gu-IN',
      ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', kn: 'kn-IN',
    };
    const mappedLang = langMap[langCode] || 'en-IN';

    setVoiceState('speaking');

    // ── Primary: Web Speech API (free, no API key, works in all modern browsers) ──
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = mappedLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Pick the best available voice for this language
      const voices = window.speechSynthesis.getVoices();
      const targetVoice =
        voices.find(v => v.lang === mappedLang && v.name.includes('Google')) ||
        voices.find(v => v.lang === mappedLang) ||
        voices.find(v => v.lang.startsWith(langCode));

      if (targetVoice) utterance.voice = targetVoice;

      utterance.onend = () => { setVoiceState('idle'); setShowIdlePrompt(true); };
      utterance.onerror = () => { setVoiceState('idle'); setShowIdlePrompt(true); };

      window.speechSynthesis.speak(utterance);
      return;
    }

    // ── Fallback: Google Cloud TTS API (only if Web Speech is unavailable) ──
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: mappedLang }),
      });

      if (!response.ok) throw new Error('TTS API unavailable');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => { setVoiceState('idle'); setShowIdlePrompt(true); URL.revokeObjectURL(url); };
      audio.onerror = () => { setVoiceState('idle'); setShowIdlePrompt(true); URL.revokeObjectURL(url); };

      await audio.play();
    } catch (err) {
      console.error('TTS fallback also failed:', err);
      setVoiceState('idle');
      setShowIdlePrompt(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (deepgramConnectionRef.current) {
      if (deepgramConnectionRef.current.readyState === WebSocket.OPEN) {
        deepgramConnectionRef.current.close();
      }
      deepgramConnectionRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const processFinalTranscript = useCallback(async (finalText: string) => {
    if (!finalText.trim()) return;
    stopListening();
    setVoiceState('thinking');

    try {
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: finalText.trim() }],
          language,
          mode: 'voice',
        })
      });

      if (chatRes.ok && chatRes.body) {
        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            fullResponse += decoder.decode(value);
            setAiResponse(fullResponse);
          }
        }

        const cleanText = fullResponse.replace(/\*/g, '');
        speakText(cleanText, language);
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setVoiceState('idle');
    }
  }, [stopListening, language, speakText]);

  const handleOrbTap = useCallback(async () => {
    if (voiceState === 'idle') {
      setVoiceState('listening');
      setTranscript('');
      setAiResponse('');
      setShowIdlePrompt(false);

      try {
        // 1. Fetch temp Deepgram key from our API route
        const res = await fetch('/api/deepgram');
        if (!res.ok) throw new Error('Failed to get Deepgram token');
        const { key } = await res.json();

        // 2. Map user language to Deepgram's supported BCP-47 language codes
        const deepgramLangMap: Record<string, string> = {
          en: 'en-IN', hi: 'hi', bn: 'bn', te: 'te', mr: 'mr',
          ta: 'ta', gu: 'gu', kn: 'kn',
        };
        const dgLang = deepgramLangMap[language] || 'en-IN';

        // 3. Connect via native WebSocket
        const params = new URLSearchParams({
          model: 'nova-2',
          language: dgLang,
          smart_format: 'true',
          interim_results: 'true',
          endpointing: '500',
        });
        const ws = new WebSocket(
          `wss://api.deepgram.com/v1/listen?${params}`,
          ['token', key]
        );
        deepgramConnectionRef.current = ws;

        let accumulatedTranscript = '';

        ws.onopen = async () => {
          // 3. Get mic access after WS is open
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm') 
              ? { mimeType: 'audio/webm' } 
              : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener('dataavailable', (event) => {
              if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                ws.send(event.data);
              }
            });

            mediaRecorder.start(250);
          } catch (micErr) {
            console.error('Mic access error:', micErr);
            stopListening();
            setVoiceState('idle');
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const transcriptText = data?.channel?.alternatives?.[0]?.transcript ?? '';

            if (transcriptText) {
              if (data.is_final) {
                accumulatedTranscript += ' ' + transcriptText;
                setTranscript(accumulatedTranscript.trim());
              } else {
                setTranscript(accumulatedTranscript + ' ' + transcriptText);
              }
            }

            if (data.speech_final && accumulatedTranscript.trim()) {
              processFinalTranscript(accumulatedTranscript.trim());
            }
          } catch {
            // non-JSON message, ignore
          }
        };

        ws.onerror = (err) => {
          console.error('Deepgram WS error:', err);
          stopListening();
          setVoiceState('idle');
        };

      } catch (err) {
        console.error('Voice start error:', err);
        setVoiceState('idle');
      }
    } else {
      // If listening, thinking, or speaking, tapping the orb interrupts and resets to idle
      stopListening();
      setVoiceState('idle');
    }
  }, [voiceState, stopListening, processFinalTranscript]);

  const handleEnd = () => {
    stopListening();
    setVoiceState('idle');
    router.back();
  };

  const getStatus = () => {
    switch (voiceState) {
      case 'listening': return { text: t('listening'), class: 'text-success-green', bg: 'bg-success-green', border: 'border-success-green/30', containerBg: 'bg-success-green/20' };
      case 'thinking': return { text: t('thinking'), class: 'text-election-amber', bg: 'bg-election-amber', border: 'border-election-amber/30', containerBg: 'bg-election-amber/20' };
      case 'speaking': return { text: t('speaking'), class: 'text-tertiary-container', bg: 'bg-tertiary-container', border: 'border-tertiary-container/30', containerBg: 'bg-tertiary-container/20' };
      default: return { text: t('idle'), class: 'text-text-muted', bg: 'bg-text-muted', border: 'border-text-muted/30', containerBg: 'bg-surface-container-highest/20' };
    }
  };

  const status = getStatus();

  return (
    <div className="bg-primary-ink text-pure-white min-h-[100dvh] w-full flex flex-col justify-between font-body-md relative overflow-hidden">
      {/* Top Action Bar */}
      <header className="w-full flex justify-between items-center p-xl z-10">
        <button
          onClick={handleEnd}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest/10 backdrop-blur-md text-pure-white hover:bg-surface-container-lowest/20 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className={cn("flex items-center gap-sm border px-lg py-sm rounded-full backdrop-blur-md transition-colors", status.border, status.containerBg)}>
          <span className={cn("w-2 h-2 rounded-full", status.bg, voiceState !== 'idle' && "animate-pulse")}></span>
          <span className={cn("font-mono-sm text-mono-sm tracking-wider uppercase", status.class)}>
            {status.text}
          </span>
        </div>

        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest/10 backdrop-blur-md text-pure-white hover:bg-surface-container-lowest/20 transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Center Stage: Voice Orb */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-xl relative z-10">
        {/* Ambient Glow Base */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-election-amber/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Voice Orb Container */}
        <button
          onClick={handleOrbTap}
          className="relative flex items-center justify-center w-[200px] h-[200px] mb-4xl group z-20"
        >
          {/* Pulsing Rings */}
          <div className="absolute inset-0 border-2 border-election-amber/30 rounded-full animate-ping [animation-duration:3s]"></div>
          <div className="absolute inset-lg border border-election-amber/20 rounded-full animate-ping [animation-duration:2s] [animation-delay:0.5s]"></div>
          
          {/* The Orb */}
          <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-election-amber to-amber-dark shadow-[0_0_60px_rgba(245,166,35,0.4)] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {/* Waveform Lines */}
            <div className="flex gap-1 items-center justify-center h-full z-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-pure-white/80 rounded-full"
                  animate={
                    voiceState === 'listening' || voiceState === 'speaking'
                      ? { height: [20, 40 + Math.random() * 40, 20] }
                      : { height: [20, 24 + Math.random() * 8, 20] }
                  }
                  transition={{
                    duration: voiceState === 'listening' ? 0.4 : 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </button>

        {/* Typography Area */}
        <div className="text-center w-full max-w-[90%] md:max-w-md mx-auto space-y-xl min-h-[120px]">
          <AnimatePresence mode="wait">
            {aiResponse && (
              <motion.h1
                key="ai-response"
                className="font-display-md text-pure-white/90 leading-tight"
                style={{ fontSize: 'clamp(20px, 6vw, 28px)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {aiResponse.replace(/\*/g, '')}
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {transcript && (
              <motion.p
                key="transcript"
                className="font-body-xl text-election-amber italic opacity-80"
                style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                &ldquo;{transcript}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="w-full p-xl flex justify-center pb-4xl z-10 relative">
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary-ink to-transparent pointer-events-none"></div>
        <div className="flex flex-col items-center gap-md z-10">
          <button
            onClick={() => router.push('/chat')}
            className="w-16 h-16 rounded-full bg-surface-container-lowest/10 backdrop-blur-xl border border-surface-container-lowest/20 flex items-center justify-center text-pure-white hover:bg-surface-container-lowest/20 transition-all"
          >
            <span className="material-symbols-outlined text-[32px]">keyboard</span>
          </button>
          <span className="font-mono-sm text-mono-sm text-text-muted uppercase tracking-widest">{t('typeInstead')}</span>
        </div>
      </footer>

      {/* Idle prompt overlay */}
      <AnimatePresence>
        {showIdlePrompt && (
          <motion.div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-end z-50 pb-8"
            style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85) 40%, transparent 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-[90%] max-w-[360px] text-black shadow-2xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-election-amber text-2xl">
                  help
                </span>
                <h3 className="text-xl font-bold font-display-md text-black">
                  {t('askMore')}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 font-body-sm">
                {t('stillHere')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowIdlePrompt(false);
                    setVoiceState('listening');
                  }}
                  className="w-full h-12 rounded-full bg-election-amber text-white font-semibold font-body-md"
                >
                  {t('keepListening')}
                </button>
                <button
                  onClick={handleEnd}
                  className="w-full h-12 rounded-full border border-gray-300 text-black font-body-md"
                >
                  {t('imDone')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
