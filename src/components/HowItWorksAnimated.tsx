import React, { useEffect, useRef, useState } from 'react';
import { Upload, Cpu, FileText, ArrowRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const HowItWorksAnimated: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 means no step is active yet
  const sectionRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    {
      id: 1,
      title: "Smart Reading",
      description: "Upload your .docx, .rtf, or .pdf sleep reports from G3 and similar systems.",
      icon: Upload
    },
    {
      id: 2,
      title: "Key Extraction & Summary",
      description: "Extracts essential sleep metrics and generates a clear summary.",
      icon: Cpu
    },
    {
      id: 3,
      title: "Review & Export",
      description: "Lets you review, edit, and export a ready-to-print PDF in seconds.",
      icon: FileText
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      // Only trigger when section is in viewport
      if (rect.top <= windowHeight * 0.2 && rect.bottom >= windowHeight * 0.2) {
        // Calculate how far we've scrolled through the section
        const scrolledIntoSection = Math.abs(Math.min(0, rect.top));
        const maxScroll = sectionHeight - windowHeight;
        const scrollProgress = Math.min(scrolledIntoSection / Math.max(maxScroll, 1), 1);
        
        // Map scroll progress to steps
        let newStep = -1;
        if (scrollProgress > 0.8) {
          newStep = 2; // Step 3
        } else if (scrollProgress > 0.5) {
          newStep = 1; // Step 2
        } else if (scrollProgress > 0.2) {
          newStep = 0; // Step 1
        }
        
        setCurrentStep(newStep);
      } else if (rect.top > windowHeight * 0.2) {
        // Section not reached yet
        setCurrentStep(-1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-pulse-50 to-background relative overflow-hidden"
      style={{ minHeight: '200vh' }}
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-6 mb-16">
          <h2 className="section-title">
            <span className="gradient-text">
              How It Works – In 3 Easy Steps
            </span>
          </h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Progress indicator */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-pulse-500 to-pulse-600 scale-110' 
                      : 'bg-muted border-2 border-muted-foreground/20'
                  }`}>
                    <span className={`font-bold text-lg transition-colors duration-500 ${
                      index <= currentStep ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {step.id}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className={`w-6 h-6 transition-all duration-500 ${
                      index < currentStep 
                        ? 'text-pulse-600 scale-110' 
                        : 'text-muted-foreground/40'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Steps content */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`absolute inset-0 w-full flex items-center justify-center transition-all duration-1000 ease-out ${
                    isActive
                      ? 'opacity-100 translate-y-0 scale-100'
                      : isPast
                      ? 'opacity-20 -translate-y-8 scale-95'
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                >
                  <div className="glass-card p-12 text-center max-w-2xl mx-auto">
                    {/* Animated icon */}
                    <div className={`w-24 h-24 bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-500 ${
                      isActive ? 'animate-pulse scale-110' : 'scale-100'
                    }`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    
                    {/* Step number */}
                    <div className="flex items-center justify-center mb-6">
                      <div className={`w-8 h-8 bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive ? 'scale-110' : 'scale-100'
                      }`}>
                        <span className="text-white font-bold text-sm">{step.id}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className={`text-foreground font-bold text-4xl md:text-5xl font-brockmann mb-6 transition-all duration-500 ${
                      isActive ? 'text-pulse-600' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-xl leading-relaxed">
                      {step.description}
                    </p>

                    {/* Animated decorative elements */}
                    {isActive && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-2 h-2 bg-pulse-400 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute top-8 right-8 w-1 h-1 bg-pulse-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-pulse-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-6 right-6 w-1 h-1 bg-pulse-600 rounded-full animate-ping opacity-40" style={{ animationDelay: '1.5s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom indicator */}
          <div className="text-center mt-16">
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-pulse-600 scale-125' 
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksAnimated;