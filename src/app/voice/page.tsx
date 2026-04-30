'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { VoiceMode } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Voice Screen — Fullscreen immersive voice interface.
 * State machine: IDLE → LISTENING → THINKING → SPEAKING → IDLE
 */
export default function VoicePage() {
  const router = useRouter();
  const [voiceState, setVoiceState] = useState<VoiceMode>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('How can I help you find your local representatives?');
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const deepgramConnectionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (deepgramConnectionRef.current) {
      // Native WebSocket close
      if (deepgramConnectionRef.current.readyState === WebSocket.OPEN) {
        deepgramConnectionRef.current.close();
      }
      deepgramConnectionRef.current = null;
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
          messages: [{ role: 'user', content: finalText.trim() }]
        })
      });

      if (chatRes.ok && chatRes.body) {
        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        setVoiceState('speaking');

        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            fullResponse += decoder.decode(value);
            setAiResponse(fullResponse);
          }
        }

        setTimeout(() => {
          setVoiceState('idle');
          setShowIdlePrompt(true);
        }, 3000);
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setVoiceState('idle');
    }
  }, [stopListening]);

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

        // 2. Connect via native WebSocket (works with any @deepgram/sdk version)
        const params = new URLSearchParams({
          model: 'nova-2',
          language: 'en-IN',
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
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
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
    } else if (voiceState === 'listening') {
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
      case 'listening': return { text: 'Listening', class: 'text-success-green', bg: 'bg-success-green', border: 'border-success-green/30', containerBg: 'bg-success-green/20' };
      case 'thinking': return { text: 'Thinking', class: 'text-election-amber', bg: 'bg-election-amber', border: 'border-election-amber/30', containerBg: 'bg-election-amber/20' };
      case 'speaking': return { text: 'Speaking', class: 'text-tertiary-container', bg: 'bg-tertiary-container', border: 'border-tertiary-container/30', containerBg: 'bg-tertiary-container/20' };
      default: return { text: 'Tap to speak', class: 'text-text-muted', bg: 'bg-text-muted', border: 'border-text-muted/30', containerBg: 'bg-surface-container-highest/20' };
    }
  };

  const status = getStatus();

  return (
    <div className="bg-primary-ink text-pure-white min-h-screen flex flex-col items-center justify-between font-body-md relative overflow-hidden">
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
          className="relative flex items-center justify-center w-[200px] h-[200px] mb-4xl group"
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
        <div className="text-center w-full max-w-md mx-auto space-y-xl min-h-[120px]">
          <AnimatePresence mode="wait">
            {aiResponse && (
              <motion.h1
                key="ai-response"
                className="font-display-md text-display-md text-pure-white/90 leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {aiResponse}
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {transcript && (
              <motion.p
                key="transcript"
                className="font-body-xl text-body-xl text-election-amber italic opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                "{transcript}"
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
          <span className="font-mono-sm text-mono-sm text-text-muted uppercase tracking-widest">Type Instead</span>
        </div>
      </footer>

      {/* Idle prompt overlay */}
      <AnimatePresence>
        {showIdlePrompt && (
          <motion.div
            className="absolute inset-0 flex items-end justify-center z-50"
            style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85) 40%, transparent 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mx-xl mb-4xl bg-pure-white rounded-2xl p-lg w-full max-w-sm text-primary-ink"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-election-amber text-[24px]">
                  help
                </span>
                <h3 className="font-display-md text-[20px] font-bold">
                  Kuch aur poochna hai?
                </h3>
              </div>
              <p className="font-body-sm text-text-secondary mb-5">
                I'm still here, ready to help.
              </p>
              <div className="flex flex-col gap-sm">
                <button
                  onClick={() => {
                    setShowIdlePrompt(false);
                    setVoiceState('listening');
                  }}
                  className="w-full h-[48px] rounded-full bg-election-amber text-pure-white font-semibold font-body-md"
                >
                  Yes, keep listening 🎤
                </button>
                <button
                  onClick={handleEnd}
                  className="w-full h-[48px] rounded-full border border-surface-variant text-primary-ink font-body-md"
                >
                  No, I'm done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
