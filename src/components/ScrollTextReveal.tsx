import React, { useEffect, useRef, useState } from 'react';

interface ScrollTextRevealProps {
  textParts: string[];
  className?: string;
}

const ScrollTextReveal: React.FC<ScrollTextRevealProps> = ({ textParts, className = "" }) => {
  const [visibleParts, setVisibleParts] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const sectionTop = rect.top;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress within the section
      const scrollProgress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight)));
      
      // Determine how many parts should be visible
      const newVisibleParts = Math.floor(scrollProgress * textParts.length);
      setVisibleParts(Math.min(newVisibleParts, textParts.length));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [textParts.length]);

  return (
    <div ref={sectionRef} className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-brockmann font-bold text-foreground mb-12">
          About Sleep Report AI
        </h1>
        <div className="space-y-8">
          {textParts.map((part, index) => (
            <p
              key={index}
              className={`text-2xl md:text-3xl lg:text-4xl leading-relaxed font-brockmann transition-all duration-1000 ease-out ${
                index < visibleParts
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 0.2}s`
              }}
            >
              {part}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollTextReveal;