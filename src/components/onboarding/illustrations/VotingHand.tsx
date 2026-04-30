'use client';

/**
 * Voting Hand Illustration — Inline SVG
 * Hand with raised index finger showing ink mark.
 * Ink (#0A0A0A) outline, amber (#F5A623) accent.
 * Surrounded by abstract orbit lines.
 */
export function VotingHandIllustration() {
  return (
    <svg
      width="220"
      height="260"
      viewBox="0 0 220 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Voting hand with ink mark illustration"
    >
      {/* Orbit rings */}
      <ellipse
        cx="110"
        cy="130"
        rx="100"
        ry="100"
        stroke="#F5A623"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <ellipse
        cx="110"
        cy="130"
        rx="80"
        ry="80"
        stroke="#F5A623"
        strokeWidth="0.5"
        opacity="0.15"
        transform="rotate(15 110 130)"
      />
      <ellipse
        cx="110"
        cy="130"
        rx="65"
        ry="65"
        stroke="#F5A623"
        strokeWidth="0.5"
        opacity="0.1"
        transform="rotate(-10 110 130)"
      />

      {/* Hand — simplified, bold editorial style */}
      {/* Palm */}
      <path
        d="M85 200 C85 185, 80 170, 82 155 C84 140, 88 135, 92 130 L92 120 C92 115, 95 112, 98 112 C101 112, 104 115, 104 120 L104 125 L104 110 C104 105, 107 102, 110 102 C113 102, 116 105, 116 110 L116 122 L116 105 C116 100, 119 97, 122 97 C125 97, 128 100, 128 105 L128 120 L128 112 C128 108, 131 105, 134 105 C137 105, 140 108, 140 112 L140 150 C140 175, 130 195, 115 205 C100 210, 85 205, 85 200Z"
        fill="white"
        stroke="#0A0A0A"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Index finger — raised */}
      <path
        d="M104 125 L104 55 C104 48, 107 44, 110 44 C113 44, 116 48, 116 55 L116 122"
        fill="white"
        stroke="#0A0A0A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ink mark on index finger */}
      <circle cx="110" cy="50" r="7" fill="#F5A623" />
      <circle cx="110" cy="50" r="4" fill="#D4891A" />

      {/* Finger nail hint */}
      <path
        d="M106 47 C106 44, 108 42, 110 42 C112 42, 114 44, 114 47"
        stroke="#0A0A0A"
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />

      {/* Kurta sleeve hint */}
      <path
        d="M78 205 C75 210, 72 220, 70 230 L150 230 C148 220, 145 210, 142 205"
        fill="#F5A623"
        stroke="#0A0A0A"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Sleeve fold lines */}
      <line x1="90" y1="215" x2="95" y2="225" stroke="#D4891A" strokeWidth="1" opacity="0.5" />
      <line x1="120" y1="212" x2="125" y2="225" stroke="#D4891A" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
