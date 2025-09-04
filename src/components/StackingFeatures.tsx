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
      const windowHeight = window.innerHeight;
      
      // Simple scroll detection: show cards based on how much the section is in view
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Calculate progress from 0 to 1 as section scrolls through viewport
      let progress = 0;
      if (sectionTop <= 0 && sectionTop > -sectionHeight + windowHeight) {
        progress = Math.abs(sectionTop) / (sectionHeight - windowHeight);
        progress = Math.max(0, Math.min(1, progress));
      }
      
      setScrollProgress(progress);

      // Update active card based on scroll progress - more lenient timing
      if (progress < 0.25) {
        setActiveCardIndex(0);
      } else if (progress < 0.65) {
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
      className="relative py-20"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
              Key Features
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            Designed to reduce manual entry, shorten turnaround time, and maintain clinical consistency.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeCardIndex >= index;
            const opacity = isActive ? 1 : 0.3;
            const scale = isActive ? 1 : 0.95;
            const translateY = isActive ? 0 : 20;

            return (
              <div 
                key={index}
                className="transition-all duration-700 ease-out"
                style={{
                  opacity,
                  transform: `translateY(${translateY}px) scale(${scale})`,
                }}
              >
                <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl sm:text-2xl text-foreground font-heading font-bold">
                          {feature.title}
                        </h3>
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                          <span className="text-sm font-medium text-primary">Feature {index + 1}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-body text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-12">
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
    </div>
  );
};