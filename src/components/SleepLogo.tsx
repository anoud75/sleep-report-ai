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
        {/* Main swirl shape */}
        <path
          d="M25 75 Q15 65 15 50 Q15 25 40 25 Q65 25 75 45 Q85 65 75 80 Q65 95 45 85 Q25 75 35 65 Q45 55 50 60 Q55 65 52 70"
          fill="url(#mainGradient)"
          className="drop-shadow-lg"
        />
        
        {/* Secondary leaf element */}
        <path
          d="M20 70 Q10 60 15 45 Q20 30 35 35 Q50 40 45 55 Q40 70 25 65"
          fill="url(#secondaryGradient)"
          className="drop-shadow-md opacity-80"
        />
        
        {/* Inner spiral */}
        <path
          d="M45 65 Q40 60 42 55 Q44 50 49 52 Q54 54 52 59 Q50 64 47 62"
          fill="url(#accentGradient)"
          className="opacity-90"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          
          <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};