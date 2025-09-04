import React, { useEffect, useRef, useState } from "react";
import { Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Accurate Analysis",
    description: "Advanced AI algorithms ensure precise extraction of sleep study data with medical-grade accuracy",
    gradient: "from-primary to-accent",
  },
  {
    icon: Zap,
    title: "Secure by Design", 
    description: "End-to-end encryption and HIPAA-compliant infrastructure protect sensitive patient information",
    gradient: "from-accent to-highlight",
  },
  {
    icon: Clock,
    title: "Streamlined Output",
    description: "Generate professional, ready-to-use reports in seconds, not hours of manual work",
    gradient: "from-highlight to-primary",
  }
];

export const StackingFeatures = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  // Card styling
  const cardStyle: React.CSSProperties = {
    height: '60vh',
    maxHeight: '600px',
    borderRadius: '20px',
    transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden'
  };

  useEffect(() => {
    // Create intersection observer to detect when section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 } // Start observing when 10% of element is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    // Optimized scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (!ticking.current) {
        lastScrollY.current = window.scrollY;
        
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          
          const sectionRect = sectionRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Use 200vh section height (reduced from 300vh)
          const scrollDistance = viewportHeight; // 1 viewport height for 200vh section
          
          // Calculate the scroll progress with faster timing
          let scrollProgress = 0;
          if (sectionRect.top <= 0) {
            scrollProgress = Math.abs(sectionRect.top) / scrollDistance;
          }
          const progress = Math.min(scrollProgress / 0.7, 1); // Make section shorter
          
          // Update card activation timing - faster transitions
          if (progress >= 0.5) {
            setActiveCardIndex(2);    // was 0.66
          } else if (progress >= 0.2) {
            setActiveCardIndex(1);    // was 0.33
          } else {
            setActiveCardIndex(0);
          }
          
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Card visibility based on active index
  const isFirstCardVisible = isIntersecting;
  const isSecondCardVisible = activeCardIndex >= 1;
  const isThirdCardVisible = activeCardIndex >= 2;

  return (
    <div 
      ref={sectionRef} 
      className="relative" 
      style={{ height: '200vh' }}
    >
      <section className="w-full h-screen py-10 md:py-16 sticky top-0 overflow-hidden bg-background">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container px-6 lg:px-8 mx-auto h-full flex flex-col relative z-10">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Key Features
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
              Designed to reduce manual entry, shorten turnaround time, and maintain clinical consistency.
            </p>
          </div>
          
          <div ref={cardsContainerRef} className="relative flex-1">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isCardVisible = 
                (index === 0 && isFirstCardVisible) ||
                (index === 1 && isSecondCardVisible) ||
                (index === 2 && isThirdCardVisible);

              return (
                <div 
                  key={index}
                  className="absolute inset-0 overflow-hidden shadow-2xl rounded-2xl" 
                  style={{
                    ...cardStyle,
                    zIndex: activeCardIndex === index ? 30 : index === 1 ? 20 : 10,
                    transform: `translateY(${activeCardIndex === index ? '0px' : activeCardIndex > index ? '20px' : '40px'}) scale(${activeCardIndex === index ? 1 : activeCardIndex > index ? 0.95 : 0.9})`,
                    opacity: isCardVisible ? (activeCardIndex === index ? 1 : 0.7) : 0,
                    pointerEvents: isCardVisible ? 'auto' : 'none'
                  }}
                >
                  <div className={`absolute inset-0 z-0 bg-gradient-to-br ${feature.gradient}`}></div>
                  
                  <div className="absolute top-4 right-4 z-20">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="text-sm font-medium text-primary-foreground">Feature {index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex items-center">
                    <div className="max-w-2xl">
                      <div className="flex items-start gap-6 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-8 w-8 text-primary-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-2xl sm:text-3xl md:text-4xl text-primary-foreground font-heading font-bold leading-tight mb-4">
                            {feature.title}
                          </h3>
                          <p className="text-primary-foreground/90 leading-relaxed font-body text-base sm:text-lg">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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