/**
 * PatwonPro's mark — inline SVG (not an <img> to a static export) so it
 * stays crisp at any sidebar/header size with a single request. Path
 * data and gradient stops are traced from the brand assets in
 * public/brand/PatwonPro_icon.svg.
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 800 800"
      className={className}
      role="img"
      aria-label="PatwonPro"
    >
      <defs>
        <linearGradient id="patwonpro-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14532D" />
          <stop offset="55%" stopColor="#4D7C0F" />
          <stop offset="100%" stopColor="#84CC16" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" rx="176" fill="url(#patwonpro-logo-bg)" />
      <g fill="#ffffff">
        <rect x="256" y="192" width="88" height="416" rx="44" />
        <path
          fillRule="evenodd"
          d="M300 192C430 192 522 258 522 356C522 454 430 500 320 500L300 500L300 420L320 420C388 420 442 396 442 356C442 314 388 272 320 272L300 272Z"
        />
      </g>
      <circle cx="600" cy="600" r="34" fill="#FACC15" />
    </svg>
  );
}
