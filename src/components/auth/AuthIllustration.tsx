'use client';

/**
 * Auth Illustration — Voter at polling booth with ID card
 * Ink outline, amber accents. Editorial flat style.
 */
export function AuthIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Voter at polling booth illustration"
    >
      {/* Polling booth outline */}
      <rect x="40" y="50" width="120" height="130" rx="4" stroke="#0A0A0A" strokeWidth="2" fill="none" />
      {/* Booth top */}
      <rect x="35" y="42" width="130" height="12" rx="3" fill="#F5A623" stroke="#0A0A0A" strokeWidth="2" />
      {/* Booth curtain */}
      <path d="M55 54 L55 170" stroke="#0A0A0A" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
      <path d="M100 54 L100 170" stroke="#0A0A0A" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
      <path d="M145 54 L145 170" stroke="#0A0A0A" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />

      {/* Person — standing at booth */}
      {/* Head */}
      <circle cx="100" cy="80" r="14" fill="white" stroke="#0A0A0A" strokeWidth="2" />
      {/* Hair */}
      <path d="M88 74 C88 66, 94 62, 100 62 C106 62, 112 66, 112 74" fill="#0A0A0A" />
      {/* Eyes */}
      <circle cx="96" cy="80" r="1.2" fill="#0A0A0A" />
      <circle cx="104" cy="80" r="1.2" fill="#0A0A0A" />
      {/* Smile */}
      <path d="M97 85 C98 87, 102 87, 103 85" stroke="#0A0A0A" strokeWidth="1" fill="none" />

      {/* Body with kurta */}
      <path
        d="M82 96 L118 96 L122 145 L78 145 Z"
        fill="#F5A623"
        stroke="#0A0A0A"
        strokeWidth="2"
      />

      {/* Voter ID card in hand */}
      <g transform="translate(60, 110) rotate(-10)">
        <rect width="24" height="16" rx="2" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />
        <rect x="3" y="3" width="7" height="8" rx="1" fill="#F5A623" opacity="0.4" />
        <line x1="13" y1="5" x2="20" y2="5" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
        <line x1="13" y1="8" x2="18" y2="8" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
      </g>

      {/* Left arm holding card */}
      <path d="M82 100 L65 118" stroke="#0A0A0A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Right arm */}
      <path d="M118 100 L130 115 L128 120" stroke="#0A0A0A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Ballot box on right */}
      <rect x="130" y="120" width="22" height="25" rx="2" fill="white" stroke="#0A0A0A" strokeWidth="1.5" />
      <rect x="136" y="125" width="10" height="2" rx="1" fill="#0A0A0A" opacity="0.3" />
      <path d="M137 128 L139 133" stroke="#F5A623" strokeWidth="1.5" opacity="0.6" />

      {/* Legs */}
      <line x1="90" y1="145" x2="88" y2="175" stroke="#0A0A0A" strokeWidth="2" />
      <line x1="110" y1="145" x2="112" y2="175" stroke="#0A0A0A" strokeWidth="2" />
      {/* Shoes */}
      <ellipse cx="86" cy="177" rx="6" ry="3" fill="#0A0A0A" />
      <ellipse cx="114" cy="177" rx="6" ry="3" fill="#0A0A0A" />
    </svg>
  );
}
