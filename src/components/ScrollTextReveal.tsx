import React, { useEffect, useRef, useState } from 'react';

interface ScrollTextRevealProps {
  textParts: string[];
  className?: string;
}

const ScrollTextReveal: React.FC<ScrollTextRevealProps> = ({ textParts, className = "" }) => {
  const [currentPart, setCurrentPart] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      // Only animate when section is prominently in view
      const isInViewport = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
      
      if (isInViewport) {
        // Calculate how far through the section we've scrolled (0 to 1)
        const scrollProgress = Math.max(0, Math.min(1, 
          (windowHeight * 0.8 - rect.top) / (sectionHeight + windowHeight * 0.6)
        ));
        
        // Map scroll progress to text parts with better timing
        const partProgress = scrollProgress * (textParts.length + 0.5); // Add buffer for smoother transitions
        const newCurrentPart = Math.min(Math.floor(partProgress), textParts.length - 1);
        
        setCurrentPart(newCurrentPart);
      }
    };

    const throttledScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', throttledScroll);
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
        <div className="relative">
          {textParts.map((part, index) => (
            <p
              key={index}
              className={`absolute inset-0 text-3xl md:text-4xl lg:text-5xl leading-relaxed font-brockmann transition-all duration-1000 ease-out ${
                index === currentPart
                  ? 'opacity-100 translate-y-0 text-white'
                  : index < currentPart
                  ? 'opacity-30 translate-y-0 text-white/20'
                  : 'opacity-0 translate-y-8 text-white'
              }`}
              style={{
                position: index === 0 ? 'relative' : 'absolute',
                top: index === 0 ? 'auto' : '0',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {renderTextWithEmphasis(part, index)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollTextReveal;