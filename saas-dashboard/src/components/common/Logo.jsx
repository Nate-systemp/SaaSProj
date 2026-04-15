import React from 'react'

const Logo = ({ size = 24, className = '', showText = true, textColor = 'currentColor' }) => {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <path
          d="M12 21L3 4H7.5L12 14L16.5 4H21L12 21Z"
          fill="url(#vantage-gradient)"
        />
        <defs>
          <linearGradient
            id="vantage-gradient"
            x1="3"
            y1="4"
            x2="21"
            y2="21"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span
          className="logo-text"
          style={{
            fontSize: `${size * 0.75}px`,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: textColor,
            fontFamily: "'Inter', sans-serif"
          }}
        >
          Vantage
        </span>
      )}
    </div>
  )
}

export default Logo
