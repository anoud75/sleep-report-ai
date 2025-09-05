import React, { useEffect, useRef, useState } from 'react';
import { Upload, Cpu, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const HowItWorksAnimated: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const navigateToAnalysis = () => {
    navigate('/analysis');
  };

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
      
      // Calculate scroll progress through the section (0 to 1)
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const progress = Math.abs(rect.top) / (sectionHeight - windowHeight);
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      } else if (rect.top > 0) {
        setScrollProgress(0);
      } else if (rect.bottom < windowHeight) {
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate which step should be visible and their states
  const getStepState = (stepIndex: number) => {
    const stepProgress = scrollProgress * 4; // More steps for smoother control
    const stepStart = stepIndex * 1.2;
    const stepEnd = stepStart + 0.8; // Shorter active period
    const fadeStart = stepEnd;
    const fadeEnd = fadeStart + 1.5; // Much longer fade period
    
    if (stepProgress < stepStart) {
      return { 
        opacity: 0, 
        transform: 'translateY(50px)', 
        textColor: 'text-foreground',
        visibility: 'opacity-0'
      };
    } else if (stepProgress >= stepStart && stepProgress < stepEnd) {
      const localProgress = (stepProgress - stepStart) / (stepEnd - stepStart);
      return {
        opacity: Math.min(localProgress * 1.5, 1),
        transform: `translateY(${(1 - localProgress) * 30}px)`,
        textColor: 'text-pulse-600',
        visibility: 'opacity-100'
      };
    } else if (stepProgress >= fadeStart && stepProgress < fadeEnd) {
      // Much slower fade to white
      const fadeProgress = (stepProgress - fadeStart) / (fadeEnd - fadeStart);
      return {
        opacity: Math.max(1 - fadeProgress * 0.7, 0.3), // Don't fade completely
        transform: `translateY(-${fadeProgress * 20}px)`, // Less movement
        textColor: fadeProgress > 0.6 ? 'text-white' : 'text-pulse-600',
        visibility: 'opacity-100'
      };
    } else {
      return {
        opacity: 0,
        transform: 'translateY(-50px)',
        textColor: 'text-white',
        visibility: 'opacity-0'
      };
    }
  };

  // Progress line calculation
  const getProgressLineHeight = () => {
    const progress = Math.min(scrollProgress * 100, 100);
    return `${progress}%`;
  };

  // CTA state calculation
  const getCTAState = () => {
    const ctaProgress = scrollProgress * 4; // Same scale as steps
    const ctaStart = 3.8; // Appears after all steps fade
    const ctaEnd = 4;
    
    if (ctaProgress < ctaStart) {
      return {
        opacity: 0,
        transform: 'translateY(50px)',
        visibility: 'opacity-0'
      };
    } else {
      const localProgress = Math.min((ctaProgress - ctaStart) / (ctaEnd - ctaStart), 1);
      return {
        opacity: localProgress,
        transform: `translateY(${(1 - localProgress) * 30}px)`,
        visibility: localProgress > 0.1 ? 'opacity-100' : 'opacity-0'
      };
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-background overflow-hidden"
      style={{ minHeight: '140vh' }}
    >
      <div className="container mx-auto px-6 relative z-20">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="section-title">
            <span className="gradient-text">How It Works – In 3 Easy Steps</span>
          </h2>
        </div>
        
        {/* Vertical progress line - only within section */}
        <div className="absolute left-1/2 top-32 bottom-24 w-px bg-muted-foreground/20 z-0" style={{ transform: 'translateX(-50%)' }}>
          <div 
            className="w-full bg-pulse-600 transition-all duration-300 ease-out"
            style={{ height: getProgressLineHeight() }}
          />
        </div>
        
        <div className="max-w-3xl mx-auto relative z-30">
          {/* Steps content - Reduced spacing */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            const state = getStepState(index);
            
            return (
              <div
                key={step.id}
                className={`py-12 flex items-center justify-center transition-all duration-700 ease-out ${state.visibility}`}
                style={{
                  opacity: state.opacity,
                  transform: state.transform
                }}
              >
                <div className="text-center max-w-xl mx-auto px-8">
                  {/* Animated step number circle */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={`relative w-16 h-16 rounded-full border-3 transition-all duration-500 ${
                      state.opacity > 0.7 ? 'border-pulse-600 bg-pulse-600/10' : 'border-muted-foreground/30'
                    }`}>
                      <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold transition-colors duration-500 ${
                        state.opacity > 0.7 ? 'text-pulse-600' : 'text-muted-foreground'
                      }`}>
                        {step.id}
                      </span>
                      
                      {/* Progress circle fill */}
                      <div 
                        className="absolute inset-0 rounded-full bg-pulse-600/20 transition-all duration-500"
                        style={{ 
                          transform: `scale(${state.opacity > 0.7 ? state.opacity : 0})`,
                          opacity: state.opacity > 0.7 ? 0.3 : 0
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Floating Icon */}
                  <div className="flex justify-center mb-6">
                    <div 
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        state.opacity > 0.7 ? 'bg-pulse-100 text-pulse-600 scale-110' : 'bg-muted text-muted-foreground scale-100'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Step Title */}
                  <h3 className={`text-2xl md:text-3xl font-brockmann font-bold mb-4 transition-all duration-500 ${state.textColor}`}>
                    {step.title}
                  </h3>
                  
                  {/* Step Description */}
                  <p className={`text-lg leading-relaxed transition-colors duration-500 ${
                    state.textColor === 'text-white' ? 'text-white/80' : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </p>

                  {/* Decorative elements that appear when step is active */}
                  {state.opacity > 0.8 && (
                    <>
                      <div className="absolute left-1/4 top-1/4 w-2 h-2 bg-pulse-400/60 rounded-full animate-ping" />
                      <div className="absolute right-1/3 top-1/3 w-1 h-1 bg-pulse-500/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute left-1/3 bottom-1/3 w-1.5 h-1.5 bg-pulse-300/50 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Call to Action Section */}
          {(() => {
            const ctaState = getCTAState();
            return (
              <div
                className={`py-16 flex items-center justify-center transition-all duration-700 ease-out ${ctaState.visibility}`}
                style={{
                  opacity: ctaState.opacity,
                  transform: ctaState.transform
                }}
              >
                <div className="text-center max-w-2xl mx-auto px-8">
                  <div className="bg-gradient-to-br from-pulse-50 to-pulse-100 rounded-2xl p-8 border border-pulse-200 shadow-lg">
                    <h3 className="text-2xl md:text-3xl font-brockmann font-bold text-pulse-600 mb-8">
                      Ready to Transform Your Sleep Reports?
                    </h3>
                    <Button 
                      onClick={navigateToAnalysis}
                      size="lg"
                      className="bg-pulse-600 hover:bg-pulse-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Start Sleep Analysis
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksAnimated;