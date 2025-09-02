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
      <img
        src="/lovable-uploads/05016f39-44ba-470e-a118-a3474cfe33f9.png"
        alt="Sleep Logo"
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
};