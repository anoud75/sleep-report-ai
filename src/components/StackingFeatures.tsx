import React, { useEffect, useRef, useState } from 'react';
import { Shield, Clock, Stethoscope } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: "Accurate Analysis",
    description: "Advanced AI algorithms ensure precise extraction of sleep study data with medical-grade accuracy",
  },
  {
    icon: Clock,
    title: "Fast Turnaround", 
    description: "Transform hours of manual report processing into minutes of automated analysis and summary generation",
  },
  {
    icon: Stethoscope,
    title: "Clinical Consistency",
    description: "Standardized reporting format ensures consistent clinical documentation across all sleep studies",
  }
];

export const StackingFeatures = () => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section has been scrolled through
      const scrollableHeight = sectionHeight - windowHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(scrolled / scrollableHeight, 1);

      setScrollProgress(progress);

      // Update active card based on scroll progress
      if (progress < 0.33) {
        setActiveCardIndex(0);
      } else if (progress < 0.66) {
        setActiveCardIndex(1);
      } else {
        setActiveCardIndex(2);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={sectionRef} 
      className="relative" 
      style={{ height: '300vh' }}
    >
      <section className="w-full h-screen py-8 md:py-12 sticky top-0 overflow-hidden bg-background">
        <div className="container px-6 lg:px-8 mx-auto h-full flex flex-col">
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
                Key Features
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
              Designed to reduce manual entry, shorten turnaround time, and maintain clinical consistency.
            </p>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeCardIndex === index;
                const opacity = isActive ? 1 : 0.3;
                const scale = isActive ? 1 : 0.9;
                const translateY = isActive ? 0 : index < activeCardIndex ? -20 : 20;

                return (
                  <div 
                    key={index}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
                    style={{
                      opacity,
                      transform: `translateY(${translateY}px) scale(${scale})`,
                      zIndex: isActive ? 10 : 1,
                    }}
                  >
                    <div className="w-full max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-2xl border border-white/10">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-2xl sm:text-3xl text-white font-heading font-bold">
                              {feature.title}
                            </h3>
                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                              <span className="text-sm font-medium text-white">Feature {index + 1}</span>
                            </div>
                          </div>
                          <p className="text-white/90 leading-relaxed font-body text-base sm:text-lg">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-3">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-500
                    ${index <= activeCardIndex 
                      ? 'bg-primary scale-125 shadow-lg shadow-primary/50' 
                      : 'bg-muted scale-100'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};