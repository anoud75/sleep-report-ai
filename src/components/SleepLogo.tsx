import React from 'react';

interface SleepLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SleepLogo: React.FC<SleepLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <img
        src="/lovable-uploads/ee69495b-37e5-4911-b938-1a112b2a08cd.png"
        alt="Sleep Logo"
        className="w-full h-full object-contain drop-shadow-lg bg-transparent"
      />
    </div>
  );
};