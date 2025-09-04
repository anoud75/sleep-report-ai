import { useEffect, useRef, useState } from "react";
import { FileText, Zap, Download, CheckCircle, Eye, Clock } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Reading",
    description: "Reads .docx reports from G3 and similar systems automatically",
    gradient: "from-primary to-accent",
    delay: 0
  },
  {
    icon: Zap,
    title: "Key Extraction & Summary",
    description: "Extracts essential sleep metrics and generates a clear summary",
    gradient: "from-accent to-highlight",
    delay: 0.2
  },
  {
    icon: Eye,
    title: "Review & Export",
    description: "Lets you review, edit, and export a ready-to-print PDF — in seconds",
    gradient: "from-highlight to-primary",
    delay: 0.4
  },
  {
    icon: CheckCircle,
    title: "Professional Summary",
    description: "Writes a professional summary based on study type",
    gradient: "from-primary to-highlight",
    delay: 0.6
  },
  {
    icon: Download,
    title: "PDF Generation",
    description: "Generates a clean, ready-to-print PDF in seconds",
    gradient: "from-accent to-primary",
    delay: 0.8
  },
  {
    icon: Clock,
    title: "Time Savings",
    description: "Fast, consistent, professional reports with no manual work",
    gradient: "from-highlight to-accent",
    delay: 1.0
  }
];

export const StackingFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => 
              prev.includes(cardIndex) ? prev : [...prev, cardIndex].sort((a, b) => a - b)
            );
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    const cards = containerRef.current?.querySelectorAll('[data-index]');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-highlight/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              How It Works – Key Features
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            Experience the power of AI-driven sleep study analysis with our streamlined workflow
          </p>
        </div>

        <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards.includes(index);
            const stackOffset = visibleCards.filter(i => i < index).length * 20;
            
            return (
              <div
                key={index}
                data-index={index}
                className={`
                  relative transition-all duration-700 ease-out transform-gpu
                  ${isVisible 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-20 opacity-0 scale-95'
                  }
                `}
                style={{
                  transform: isVisible 
                    ? `translateY(-${stackOffset}px) scale(${1 - (stackOffset * 0.02)})` 
                    : 'translateY(80px) scale(0.95)',
                  zIndex: features.length - index,
                  transitionDelay: `${feature.delay}s`
                }}
              >
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 hover:bg-card/90 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 group">
                  <div className="flex items-start gap-6">
                    <div className={`
                      w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} 
                      flex items-center justify-center flex-shrink-0
                      group-hover:scale-110 transition-transform duration-300
                      shadow-lg shadow-primary/20
                    `}>
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-heading font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-body text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 right-6 w-1 h-1 bg-accent/50 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex gap-2">
            {features.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-500
                  ${visibleCards.includes(index) 
                    ? 'bg-primary scale-125' 
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