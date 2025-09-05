import React, { useEffect, useRef, useState } from 'react';

interface ScrollTextRevealProps {
  textParts: string[];
  className?: string;
}

const ScrollTextReveal: React.FC<ScrollTextRevealProps> = ({ textParts, className = "" }) => {
  const [currentPart, setCurrentPart] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      // Only trigger when section is in the center of viewport
      if (rect.top <= windowHeight * 0.1 && rect.bottom >= windowHeight * 0.9) {
        // Calculate how far we've scrolled through the section
        const scrolledIntoSection = Math.abs(Math.min(0, rect.top));
        const maxScroll = sectionHeight - windowHeight;
        const scrollProgress = Math.min(scrolledIntoSection / Math.max(maxScroll, 1), 1);
        
        // Map to text parts with clear thresholds
        let newPart = 0;
        if (scrollProgress > 0.6) {
          newPart = 1; // Second sentence
        } else if (scrollProgress > 0.1) {
          newPart = 0; // First sentence
        }
        
        setCurrentPart(Math.min(newPart, textParts.length - 1));
      } else if (rect.top > windowHeight * 0.1) {
        // Section not reached yet
        setCurrentPart(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [textParts.length]);

  const renderTextWithEmphasis = (text: string, index: number) => {
    if (index === textParts.length - 1 && text.includes('seconds')) {
      // Special handling for the last part with "seconds" emphasis
      const parts = text.split('seconds');
      return (
        <>
          {parts[0]}
          <span className="text-white animate-pulse font-bold text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            seconds
          </span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <div 
      ref={sectionRef} 
      className={`min-h-screen flex items-center justify-center ${className}`}
      style={{ minHeight: '100vh' }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-brockmann font-bold text-white mb-12 drop-shadow-2xl">
          About Sleep Report AI
        </h1>
        <div className="relative min-h-[300px] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 rounded-2xl backdrop-blur-sm"></div>
          {textParts.map((part, index) => (
            <div
              key={index}
              className={`relative z-10 w-full text-3xl md:text-4xl lg:text-5xl leading-relaxed font-brockmann transition-all duration-1000 ease-out ${
                index === currentPart
                  ? 'opacity-100 translate-y-0 text-white drop-shadow-2xl'
                  : index < currentPart
                  ? 'opacity-20 translate-y-0 text-white/60 drop-shadow-lg'
                  : 'opacity-0 translate-y-8 text-white/80 drop-shadow-lg'
              }`}
              style={{ position: 'absolute' }}
            >
              <p className="text-center px-8">
                {renderTextWithEmphasis(part, index)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollTextReveal;