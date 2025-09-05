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
           <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse font-bold text-2xl md:text-3xl">
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
      className={`min-h-screen flex items-center justify-center bg-white ${className}`}
      style={{ 
        minHeight: '100vh'
      }}
    >
      <div className="text-center px-6 md:px-20 lg:px-48 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="gradient-text">About Sleep Report AI</span>
        </h1>
        <div className="relative min-h-[400px] flex items-center justify-center">
          {textParts.map((part, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full flex items-center justify-center transition-all duration-1000 ease-out ${
                index === currentPart
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              <p 
                className="text-center text-2xl md:text-4xl font-light text-foreground/80 tracking-wide leading-relaxed max-w-2xl mx-auto"
              >
                {renderTextWithEmphasis(part.replace(/^-\s*/, '').replace(/—\s*/, ''), index)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollTextReveal;