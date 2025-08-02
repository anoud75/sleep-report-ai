import React from 'react';

interface SleepLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SleepLogo: React.FC<SleepLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Koala head outline */}
        <ellipse
          cx="50"
          cy="58"
          rx="22"
          ry="26"
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Left ear (koala style - oval) */}
        <ellipse
          cx="35"
          cy="40"
          rx="8"
          ry="12"
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Right ear (koala style - oval) */}
        <ellipse
          cx="65"
          cy="40"
          rx="8"
          ry="12"
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Brain pattern inside head */}
        <path
          d="M38 52 Q42 48 46 52 Q50 48 54 52 Q58 48 62 52"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-70"
        />
        <path
          d="M40 58 Q44 54 48 58 Q52 54 56 58 Q60 54 64 58"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-70"
        />
        <path
          d="M42 64 Q46 60 50 64 Q54 60 58 64"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-70"
        />
        
        {/* Closed sleepy eyes */}
        <path
          d="M42 50 Q44 48 46 50"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-90"
        />
        <path
          d="M54 50 Q56 48 58 50"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-90"
        />
        
        {/* Small koala nose */}
        <ellipse
          cx="50"
          cy="56"
          rx="2"
          ry="1.5"
          fill="url(#gradient)"
          className="opacity-80"
        />
        
        {/* Sleep Z's */}
        <text
          x="72"
          y="25"
          fontSize="8"
          fill="url(#gradient)"
          fontFamily="serif"
          className="animate-pulse"
        >
          Z
        </text>
        <text
          x="78"
          y="18"
          fontSize="6"
          fill="url(#gradient)"
          fontFamily="serif"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        >
          z
        </text>
        <text
          x="82"
          y="12"
          fontSize="4"
          fill="url(#gradient)"
          fontFamily="serif"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        >
          z
        </text>
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};