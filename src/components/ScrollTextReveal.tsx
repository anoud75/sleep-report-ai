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
      
      // Check if section is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        setIsVisible(true);
        
        // Calculate scroll progress within the section
        const sectionProgress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + rect.height)
        ));
        
        // Determine which text part to show
        const partIndex = Math.floor(sectionProgress * textParts.length);
        const clampedIndex = Math.min(Math.max(0, partIndex), textParts.length - 1);
        
        setCurrentPart(clampedIndex);
      } else {
        setIsVisible(false);
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
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-brockmann font-bold text-white mb-12 opacity-90">
          About Sleep Report AI
        </h1>
        <div className="relative min-h-[300px] flex items-center justify-center">
          {textParts.map((part, index) => (
            <div
              key={index}
              className={`absolute w-full text-3xl md:text-4xl lg:text-5xl leading-relaxed font-brockmann transition-all duration-1000 ease-out ${
                index === currentPart
                  ? 'opacity-100 translate-y-0 text-white'
                  : index < currentPart
                  ? 'opacity-30 translate-y-0 text-white/40'
                  : 'opacity-0 translate-y-8 text-white'
              }`}
            >
              <p className="text-center">
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