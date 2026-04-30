'use client';

/**
 * Walking Voter Illustration — Inline SVG
 * Person walking confidently with smartphone.
 * Amber kurta, ink outline. Ballot floating beside.
 */
export function WalkingVoterIllustration() {
  return (
    <svg
      width="200"
      height="240"
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Voter walking with smartphone illustration"
    >
      {/* Head */}
      <circle cx="100" cy="42" r="18" fill="white" stroke="#0A0A0A" strokeWidth="2" />
      {/* Hair */}
      <path
        d="M85 35 C85 25, 95 20, 100 20 C105 20, 115 25, 115 35"
        fill="#0A0A0A"
        stroke="#0A0A0A"
        strokeWidth="1.5"
      />
      {/* Eyes */}
      <circle cx="94" cy="42" r="1.5" fill="#0A0A0A" />
      <circle cx="106" cy="42" r="1.5" fill="#0A0A0A" />
      {/* Smile */}
      <path d="M96 48 C98 51, 102 51, 104 48" stroke="#0A0A0A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Neck */}
      <line x1="100" y1="60" x2="100" y2="68" stroke="#0A0A0A" strokeWidth="2" />

      {/* Kurta body — amber */}
      <path
        d="M75 70 L125 70 L130 140 L70 140 Z"
        fill="#F5A623"
        stroke="#0A0A0A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Kurta collar */}
      <path d="M90 70 L100 80 L110 70" stroke="#0A0A0A" strokeWidth="1.5" fill="none" />
      {/* Kurta fold lines */}
      <line x1="88" y1="90" x2="85" y2="130" stroke="#D4891A" strokeWidth="1" opacity="0.5" />
      <line x1="112" y1="90" x2="115" y2="130" stroke="#D4891A" strokeWidth="1" opacity="0.5" />

      {/* Left arm — holding phone */}
      <path
        d="M75 75 L55 100 L58 110"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hand */}
      <circle cx="57" cy="112" r="4" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />
      {/* Phone */}
      <rect x="48" y="100" width="12" height="20" rx="2" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />
      <rect x="50" y="103" width="8" height="13" rx="1" fill="#F5A623" opacity="0.3" />

      {/* Right arm — swinging */}
      <path
        d="M125 75 L142 105 L138 115"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="137" cy="117" r="4" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />

      {/* Legs — walking stride */}
      {/* Left leg */}
      <path
        d="M85 140 L75 190 L72 200"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left shoe */}
      <path d="M72 200 L65 202 L65 205 L75 205 L75 200" fill="#0A0A0A" />

      {/* Right leg */}
      <path
        d="M115 140 L125 185 L128 195"
        stroke="#0A0A0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right shoe */}
      <path d="M128 195 L135 197 L135 200 L125 200 L125 195" fill="#0A0A0A" />

      {/* Floating ballot paper beside person */}
      <g opacity="0.7" transform="translate(148, 65) rotate(8)">
        <rect width="28" height="36" rx="2" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />
        <line x1="5" y1="8" x2="23" y2="8" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
        <line x1="5" y1="13" x2="23" y2="13" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
        <line x1="5" y1="18" x2="18" y2="18" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
        <circle cx="8" cy="26" r="2" fill="#F5A623" />
        <circle cx="14" cy="26" r="2" stroke="#0A0A0A" strokeWidth="0.8" fill="none" />
        <circle cx="20" cy="26" r="2" stroke="#0A0A0A" strokeWidth="0.8" fill="none" />
      </g>
    </svg>
  );
}
