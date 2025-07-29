const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="320"
        height="50"
        viewBox="0 0 320 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="primaryGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: '#4f46e5' }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed' }} />
          </linearGradient>

          <linearGradient
            id="accentGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: '#06b6d4' }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
          </linearGradient>

          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
            <feOffset dx="1" dy="1" result="offset" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
          <text
            x="20"
            y="28"
            fontSize="24"
            fontWeight="700"
            fill="#FFFFFF"
            letterSpacing="-0.5px"
            filter="url(#textShadow)"
          >
            Sync
          </text>

          <text
            x="20"
            y="50"
            fontSize="24"
            fontWeight="700"
            fill="url(#accentGradient)"
            letterSpacing="-0.5px"
            filter="url(#textShadow)"
          >
            Talk
          </text>
        </g>

        <text
          x="74"
          y="37"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontSize="12"
          fontWeight="500"
          fill="#FFFFFF"
          letterSpacing="1px"
        >
          SYNCHRONIZED COMMUNICATION
        </text>
      </svg>
    </div>
  );
};

export default Logo;
