'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

type Lang = 'hi' | 'en';

/** Resolve a 6-digit pincode to district/state using India Post's public API */
async function lookupPincode(pin: string): Promise<{ district: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return { district: po.District, state: po.State };
    }
    return null;
  } catch {
    return null;
  }
}

export default function LocationSetupPage() {
  const router = useRouter();
  const { setConstituency, setPincode, user } = useAppStore();

  const [pincode, setPincodeLocal] = useState('');
  const [lang, setLang] = useState<Lang>('hi');
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      return;
    }
    setGpsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse-geocode lat/lng to pincode via Nominatim (free, no key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const geo = await res.json();
          const detectedPin = geo?.address?.postcode?.replace(/\D/g, '').slice(0, 6) || '';
          const district = geo?.address?.county || geo?.address?.city || geo?.address?.town || 'Your Area';
          const state = geo?.address?.state || 'India';

          const constituency = {
            id: detectedPin || 'gps',
            name: district,
            state,
            electionType: 'lok_sabha' as const,
            pincodeRanges: detectedPin ? [detectedPin] : [],
          };
          setConstituency(constituency);
          if (detectedPin) setPincode(detectedPin);

          // Save to Firestore if user is signed in
          if (user?.id) {
            fetch('/api/user/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid: user.id, constituency, pincode: detectedPin, language: lang }),
            }).catch(console.warn);
          }

          setGpsLoading(false);
          router.push('/auth');
        } catch {
          setGpsLoading(false);
          setError('Could not determine location. Please enter your pincode.');
        }
      },
      () => {
        setGpsLoading(false);
        setError('Could not access location. Please enter your pincode.');
      }
    );
  };

  const handleContinue = async () => {
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }
    setLoading(true);
    setError('');

    // Look up the real district/state for this pincode
    const locationData = await lookupPincode(pincode);
    const constituency = {
      id: pincode,
      name: locationData ? `${locationData.district}` : `Constituency (${pincode})`,
      state: locationData?.state || 'India',
      electionType: 'lok_sabha' as const,
      pincodeRanges: [pincode],
    };

    setPincode(pincode);
    setConstituency(constituency);

    // Save constituency + language to Firestore if user already signed in
    if (user?.id) {
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, constituency, pincode, language: lang }),
      }).catch(console.warn);
    }

    router.push('/auth');
  };

  return (
    <div
      className="min-h-dvh w-full flex flex-col items-center justify-center p-6 relative"
      style={{ background: '#FAFAF5' }}
    >
      {/* Progress bar — 4 segments, last active */}
      <div className="fixed top-6 left-0 w-full flex justify-center px-6 gap-2 z-10">
        {[false, false, false, true].map((active, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{ background: active ? '#F5A623' : '#F0EBE0' }}
          />
        ))}
      </div>

      {/* Main card */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[390px] mx-auto flex flex-col gap-8 mt-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className="mb-2 tracking-tight"
            style={{ fontFamily: 'Epilogue, sans-serif', fontSize: '36px', fontWeight: 700, lineHeight: 1.1, color: '#0A0A0A' }}
          >
            Where are you voting?
          </h1>
          <p
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7 }}
          >
            We need your location to show you the candidates for your specific constituency.
          </p>
        </div>

        {/* White card */}
        <div
          className="flex flex-col gap-4 p-6 rounded-3xl"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e3de',
          }}
        >
          {/* Pincode input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="pincode"
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#524534',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Enter Pincode
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9E9E9E', fontSize: '20px' }}
              >
                pin_drop
              </span>
              <input
                id="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={pincode}
                onChange={(e) => {
                  setError('');
                  setPincodeLocal(e.target.value.replace(/\D/g, ''));
                }}
                className="w-full h-16 rounded-xl pl-12 pr-4 text-center tracking-[0.4em] focus:outline-none focus:ring-2 transition-shadow"
                style={{
                  background: '#F0EBE0',
                  border: 'none',
                  fontFamily: 'Space Grotesk, monospace',
                  fontSize: '24px',
                  color: '#0A0A0A',
                  boxShadow: error ? '0 0 0 2px #ba1a1a' : undefined,
                }}
              />
            </div>
            {error && (
              <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', color: '#ba1a1a' }}>
                {error}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3" style={{ color: '#9E9E9E' }}>
            <div className="h-px flex-1" style={{ background: '#e8e8e4' }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              or
            </span>
            <div className="h-px flex-1" style={{ background: '#e8e8e4' }} />
          </div>

          {/* GPS button */}
          <button
            onClick={handleGPS}
            disabled={gpsLoading}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-full active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{
              background: '#FFFFFF',
              border: '2px solid #e2e3de',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              color: '#0A0A0A',
            }}
          >
            {gpsLoading ? (
              <span className="w-5 h-5 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
                my_location
              </span>
            )}
            Use my current location
          </button>
        </div>

        {/* Language toggle */}
        <div className="flex flex-col gap-3 items-center">
          <p
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#5C5C5C',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Preferred Language
          </p>
          <div className="flex gap-2 p-1 rounded-full" style={{ background: '#F0EBE0' }}>
            {(['hi', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-6 py-2 rounded-full transition-all"
                style={{
                  background: lang === l ? '#0A0A0A' : 'transparent',
                  color: lang === l ? '#FFFFFF' : '#5C5C5C',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                }}
              >
                {l === 'hi' ? 'हिंदी' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-14 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
          style={{
            background: '#F5A623',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(245,166,35,0.4)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '17px',
            fontWeight: 700,
          }}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>
      </motion.main>
    </div>
  );
}
