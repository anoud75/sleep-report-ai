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
        {/* Main spiral swirl shape matching the uploaded design */}
        <path
          d="M20 30 Q10 20 20 10 Q40 5 60 15 Q85 30 85 55 Q85 80 60 85 Q35 85 25 65 Q20 45 35 40 Q50 40 55 50 Q58 60 50 65 Q42 65 40 58 Q38 52 42 50 Q46 50 47 52"
          fill="url(#spiralGradient)"
          className="drop-shadow-2xl"
        />
        
        {/* Additional flowing element for depth */}
        <path
          d="M15 35 Q8 25 15 15 Q30 8 45 18 Q65 35 60 55 Q55 70 40 65 Q28 58 30 50"
          fill="url(#flowGradient)"
          className="opacity-60"
        />
        
        {/* Gradient definitions matching the uploaded design */}
        <defs>
          <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" />
            <stop offset="30%" stopColor="#ff4757" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};