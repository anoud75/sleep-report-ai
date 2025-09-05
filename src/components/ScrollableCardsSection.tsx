import React, { useEffect, useRef, useState } from 'react';

interface Card {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

interface ScrollableCardsSectionProps {
  cards: Card[];
  title: string;
  subtitle: string;
  sectionHeight?: string;
  backgroundColor?: string;
}

const ScrollableCardsSection: React.FC<ScrollableCardsSectionProps> = ({
  cards,
  title,
  subtitle,
  sectionHeight = "200vh",
  backgroundColor = "bg-background"
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if section is in viewport
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        // Calculate scroll progress within the section
        const scrollProgress = Math.abs(rect.top) / (section.offsetHeight - windowHeight);
        
        // Calculate which card should be active based on scroll progress
        const cardThresholds = cards.map((_, index) => (index + 1) / cards.length);
        
        for (let i = 0; i < cardThresholds.length; i++) {
          if (scrollProgress >= cardThresholds[i] * 0.7) {
            setActiveCardIndex(i + 1);
          } else if (scrollProgress < cardThresholds[0] * 0.7) {
            setActiveCardIndex(0);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [cards.length]);

  return (
    <div 
      ref={sectionRef}
      className={`relative ${backgroundColor}`}
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-6">
              <span className="gradient-text">
                {title}
              </span>
            </h2>
            <p className="section-subtitle mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Cards Container */}
          <div className="relative max-w-4xl mx-auto h-[400px] lg:h-[500px]">
            {cards.map((card, index) => {
              const isActive = index <= activeCardIndex;
              const cardStyle = {
                transform: isActive 
                  ? `scale(1) translateY(${index * -20}px)` 
                  : `scale(0.8) translateY(${100 + index * 20}px)`,
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? index + 1 : 0,
                transitionDelay: `${index * 0.1}s`,
              };

              return (
                <div
                  key={card.id}
                  className="scrollable-card absolute inset-0 w-full h-full"
                  style={cardStyle}
                >
                  {card.backgroundImage && (
                    <div className="absolute inset-0">
                      <img
                        src={card.backgroundImage}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent backdrop-blur-sm flex flex-col justify-end p-8 border border-white/10 rounded-2xl">
                    <div className="text-white">
                      <h3 className="text-2xl lg:text-3xl font-brockmann font-bold mb-3 text-white">
                        {card.title}
                      </h3>
                      <p className="text-lg text-white/90 leading-relaxed max-w-md">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              {cards.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index <= activeCardIndex
                      ? 'bg-pulse-500 scale-125'
                      : 'bg-muted scale-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollableCardsSection;