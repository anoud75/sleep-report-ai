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
        {/* Bear/Panda head outline */}
        <circle
          cx="50"
          cy="55"
          r="28"
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Left ear */}
        <circle
          cx="35"
          cy="35"
          r="12"
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Right ear */}
        <circle
          cx="65"
          cy="35"
          r="12"
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Sleep mask/eye area */}
        <ellipse
          cx="50"
          cy="52"
          rx="18"
          ry="8"
          stroke="url(#gradient)"
          strokeWidth="3"
          fill="url(#maskGradient)"
          className="drop-shadow-md"
        />
        
        {/* Closed eye/sleep symbol */}
        <ellipse
          cx="50"
          cy="52"
          rx="3"
          ry="2"
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
          <linearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.2)" />
            <stop offset="100%" stopColor="hsl(var(--secondary) / 0.3)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};