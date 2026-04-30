'use client';

/**
 * Speaking Person Illustration — Inline SVG
 * Person seated cross-legged speaking with sound waves.
 * Ink outline on amber background.
 */
export function SpeakingPersonIllustration() {
  return (
    <svg
      width="200"
      height="220"
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Person speaking illustration"
    >
      {/* Head */}
      <circle cx="100" cy="45" r="20" fill="white" stroke="#0A0A0A" strokeWidth="2" />
      {/* Hair — dupatta/scarf style */}
      <path
        d="M82 38 C82 25, 92 18, 100 18 C108 18, 118 25, 118 38"
        fill="#0A0A0A"
        stroke="#0A0A0A"
        strokeWidth="1.5"
      />
      {/* Bindi */}
      <circle cx="100" cy="34" r="1.5" fill="#D94F4F" />
      {/* Eyes */}
      <circle cx="93" cy="44" r="1.5" fill="#0A0A0A" />
      <circle cx="107" cy="44" r="1.5" fill="#0A0A0A" />
      {/* Open mouth speaking */}
      <ellipse cx="100" cy="52" rx="4" ry="3" fill="#0A0A0A" opacity="0.7" />

      {/* Sound waves from mouth */}
      <path d="M115 48 C119 44, 119 52, 115 48" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M120 43 C126 37, 126 55, 120 49" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.35" />
      <path d="M126 39 C134 31, 134 59, 126 51" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.2" />

      {/* Neck */}
      <line x1="100" y1="65" x2="100" y2="72" stroke="#0A0A0A" strokeWidth="2" />

      {/* Body — seated, wearing kurta */}
      <path
        d="M70 75 L130 75 L135 130 L65 130 Z"
        fill="white"
        stroke="#0A0A0A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Kurta neckline */}
      <path d="M88 75 L100 85 L112 75" stroke="#0A0A0A" strokeWidth="1.5" fill="none" />
      {/* Fold lines */}
      <line x1="85" y1="90" x2="82" y2="125" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.2" />
      <line x1="115" y1="90" x2="118" y2="125" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.2" />

      {/* Left arm resting */}
      <path
        d="M70 80 L55 105 L60 120"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="60" cy="122" r="4" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />

      {/* Right arm gesturing */}
      <path
        d="M130 80 L148 95 L145 85"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="144" cy="83" r="4" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />

      {/* Cross-legged legs */}
      <path
        d="M75 130 L60 160 L55 170"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M125 130 L140 160 L145 170"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cross over */}
      <path
        d="M55 170 L80 155 L100 165"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M145 170 L120 155 L100 165"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Ground shadow */}
      <ellipse cx="100" cy="180" rx="55" ry="6" fill="#0A0A0A" opacity="0.06" />
    </svg>
  );
}
