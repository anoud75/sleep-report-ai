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
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-trust to-success rounded-full"></div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Study Type Selection</h2>
          <Sparkles className="h-5 w-5 text-trust" />
        </div>
        <p className="text-muted-foreground ml-7 font-body">Choose the appropriate study protocol for analysis</p>
      </div>

      {/* Study Type Cards */}
      <div className="grid gap-4">
        {studyTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <div
              key={type.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ease-out border-2 rounded-2xl p-6 ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'border-border bg-card hover:border-primary/50 hover:shadow-lg hover:bg-primary/5'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              {/* Remove the Selection Glow Effect */}
              <div className="absolute inset-0 opacity-0"></div>
              
              <div className="relative flex items-start gap-6">
                {/* Icon Container */}
                <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-primary/20 shadow-lg shadow-primary/20 border border-primary/30' 
                    : 'bg-muted/50 border border-border group-hover:bg-primary/10 group-hover:border-primary/30'
                }`}>
                  <Icon className={`h-7 w-7 transition-all duration-300 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  }`} />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-5 w-5 text-primary bg-background rounded-full shadow-lg" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-xl font-bold font-heading transition-colors duration-300 ${
                          isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                        }`}>
                          {type.name}
                        </h3>
                      </div>
                      <p className={`text-sm leading-relaxed font-body transition-colors duration-300 ${
                        isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {type.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                          : 'bg-muted/30 border border-border group-hover:bg-primary/5 group-hover:border-primary/20'
                      }`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                          isSelected ? 'bg-primary shadow-sm' : 'bg-muted-foreground group-hover:bg-primary'
                        }`}></div>
                        <span className={`text-xs font-medium font-body leading-tight transition-colors duration-300 ${
                          isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
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