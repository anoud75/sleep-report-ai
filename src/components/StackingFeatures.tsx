import { useEffect, useRef, useState } from "react";
import { Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Accurate Analysis",
    description: "Advanced AI algorithms ensure precise extraction of sleep study data with medical-grade accuracy",
    gradient: "from-primary to-accent",
    zIndex: 30,
    initialScale: 1,
    initialY: 0
  },
  {
    icon: Zap,
    title: "Secure by Design",
    description: "End-to-end encryption and HIPAA-compliant infrastructure protect sensitive patient information",
    gradient: "from-accent to-highlight", 
    zIndex: 20,
    initialScale: 0.95,
    initialY: 100
  },
  {
    icon: Clock,
    title: "Streamlined Output",
    description: "Generate professional, ready-to-use reports in seconds, not hours of manual work",
    gradient: "from-highlight to-primary",
    zIndex: 10,
    initialScale: 0.9,
    initialY: 200
  }
];

export const StackingFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Calculate scroll progress when container is in view
        const scrollStart = rect.top - viewportHeight + containerHeight / 3;
        const scrollEnd = rect.top - viewportHeight / 3;
        
        if (scrollStart > 0) {
          setScrollProgress(0);
          setActiveCard(0);
        } else if (scrollEnd < 0) {
          setScrollProgress(1);
          setActiveCard(2);
        } else {
          const progress = Math.abs(scrollStart) / Math.abs(scrollStart - scrollEnd);
          setScrollProgress(Math.min(Math.max(progress, 0), 1));
          
          // Determine active card based on scroll progress
          if (progress < 0.33) {
            setActiveCard(0);
          } else if (progress < 0.66) {
            setActiveCard(1);
          } else {
            setActiveCard(2);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const getCardTransform = (index: number) => {
    const feature = features[index];
    const progress = Math.min(Math.max((scrollProgress - index / 3) * 3, 0), 1);
    
    const translateY = feature.initialY * (1 - progress);
    const scale = feature.initialScale + (1 - feature.initialScale) * progress;
    const opacity = 0.3 + 0.7 * progress;
    
    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity: index <= activeCard ? 1 : opacity,
      zIndex: feature.zIndex
    };
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              Key Features
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            Designed to reduce manual entry, shorten turnaround time, and maintain clinical consistency.
          </p>
        </div>

        <div 
          ref={containerRef}
          className="max-w-4xl mx-auto relative"
          style={{ height: '120vh' }} // Extra height for scroll effect
        >
          <div className="sticky top-24 space-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const cardStyle = getCardTransform(index);
              
              return (
                <div
                  key={index}
                  className="absolute inset-x-0 will-change-transform backface-hidden"
                  style={{
                    ...cardStyle,
                    transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <div className={`
                    bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 
                    hover:bg-card/95 transition-all duration-500 hover:scale-[1.02] 
                    hover:shadow-2xl hover:shadow-primary/10 group card-enter
                    ${index <= activeCard ? 'animate-card-enter' : ''}
                  `}>
                    <div className="flex items-start gap-6">
                      <div className={`
                        w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} 
                        flex items-center justify-center flex-shrink-0
                        group-hover:scale-110 transition-transform duration-300
                        shadow-lg shadow-primary/20
                      `}>
                        <Icon className="h-10 w-10 text-primary-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-3xl font-heading font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed font-body text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-6 right-6 w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-6 right-8 w-2 h-2 bg-accent/50 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex gap-3">
            {features.map((_, index) => (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full transition-all duration-500
                  ${index <= activeCard 
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
  );
};