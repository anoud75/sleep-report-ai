import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Settings, Layers, CheckCircle, Sparkles } from "lucide-react";

interface StudyTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const studyTypes = [
  {
    id: 'Diagnostic',
    name: 'Diagnostic (PSG)',
    description: 'Comprehensive baseline sleep assessment',
    icon: Stethoscope,
    themeColor: 'diagnostic',
    details: ['Complete polysomnography', 'Sleep architecture analysis', 'Respiratory event scoring']
  },
  {
    id: 'Titration',
    name: 'Titration Study',
    description: 'Optimal CPAP pressure determination',
    icon: Settings,
    themeColor: 'titration',
    details: ['CPAP pressure optimization', 'Leak assessment', 'Efficacy evaluation']
  },
  {
    id: 'Split-Night',
    name: 'Split Night Protocol',
    description: 'Hybrid diagnostic and therapeutic study',
    icon: Layers,
    themeColor: 'split-night',
    details: ['Initial diagnostic phase', 'Real-time CPAP titration', 'Combined analysis']
  }
];

export const StudyTypeSelector = ({ selectedType, onTypeSelect }: StudyTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-trust to-success rounded-full animate-glow-pulse"></div>
          <h2 className="text-2xl font-bold text-white font-jakarta glow-text">Study Type Selection</h2>
          <Sparkles className="h-5 w-5 text-trust animate-rotate-slow protocol-icon" />
        </div>
        <p className="text-white/70 ml-7 font-inter">Choose the appropriate study protocol for analysis</p>
      </div>

      {/* Study Type Cards */}
      <div className="grid gap-4">
        {studyTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <div
              key={type.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out border-2 animate-fade-in-up haptic-feedback rounded-2xl p-6 ${
                isSelected 
                  ? 'border-primary bg-black/80 shadow-[var(--shadow-glow)] scale-[1.02] backdrop-blur-xl'
                  : 'border-white/10 bg-black/40 hover:border-primary/50 hover:shadow-[var(--shadow-medical)] hover:bg-black/60 backdrop-blur-sm'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={() => onTypeSelect(type.id)}
            >
              {/* Selection Glow Effect */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-70 animate-shimmer bg-[length:200%_100%]"></div>
              )}
              
              <div className="relative flex items-start gap-6">
                {/* Icon Container */}
                <div className={`protocol-icon relative p-4 rounded-2xl transition-all duration-700 ${
                  isSelected 
                    ? 'bg-primary/20 shadow-[var(--shadow-glow)] border border-primary/30' 
                    : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-primary/30'
                }`}>
                  <Icon className={`h-7 w-7 transition-all duration-500 ${
                    isSelected ? 'text-primary' : 'text-white/60 group-hover:text-white/90'
                  }`} />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 animate-scale-in">
                      <CheckCircle className="h-5 w-5 text-primary bg-black rounded-full shadow-lg" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-xl font-bold font-jakarta transition-colors duration-500 ${
                          isSelected ? 'text-primary' : 'text-white group-hover:text-white/95'
                        }`}>
                          {type.name}
                        </h3>
                      </div>
                      <p className={`text-sm leading-relaxed font-inter transition-colors duration-500 ${
                        isSelected ? 'text-white/90' : 'text-white/70 group-hover:text-white/85'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {type.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-500 hover:scale-105 haptic-feedback ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary/20 animate-fade-in shadow-sm' 
                          : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
                      }`} style={{animationDelay: `${detailIndex * 0.1}s`}}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-500 ${
                          isSelected ? 'bg-primary animate-glow-pulse shadow-sm' : 'bg-white/30 group-hover:bg-white/50'
                        }`}></div>
                        <span className={`text-xs font-medium font-inter leading-tight transition-colors duration-500 ${
                          isSelected ? 'text-white/95' : 'text-white/70 group-hover:text-white/85'
                        }`}>
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};