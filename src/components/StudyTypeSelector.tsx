import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, GitBranch, CheckCircle2, Sparkles } from "lucide-react";

interface StudyTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const studyTypes = [
  {
    id: 'Diagnostic',
    name: 'Diagnostic (PSG)',
    description: 'Comprehensive baseline sleep assessment',
    icon: Activity,
    themeColor: 'diagnostic',
    details: ['Complete polysomnography', 'Sleep architecture analysis', 'Respiratory event scoring'],
    badge: 'Standard'
  },
  {
    id: 'Titration',
    name: 'Titration Study',
    description: 'Optimal CPAP pressure determination',
    icon: Zap,
    themeColor: 'titration',
    details: ['CPAP pressure optimization', 'Leak assessment', 'Efficacy evaluation'],
    badge: 'Advanced'
  },
  {
    id: 'Split-Night',
    name: 'Split Night Protocol',
    description: 'Hybrid diagnostic and therapeutic study',
    icon: GitBranch,
    themeColor: 'split-night',
    details: ['Initial diagnostic phase', 'Real-time CPAP titration', 'Combined analysis'],
    badge: 'Premium'
  }
];

export const StudyTypeSelector = ({ selectedType, onTypeSelect }: StudyTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h2 className="text-2xl font-bold text-foreground">Study Type Selection</h2>
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground ml-7">Choose the appropriate study protocol for analysis</p>
      </div>

      {/* Study Type Cards */}
      <div className="grid gap-4">
        {studyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-500 ease-out border-2 ${
                isSelected 
                  ? `border-${type.themeColor} bg-${type.themeColor}-light shadow-[var(--shadow-elegant)] scale-[1.02]`
                  : 'border-border bg-card hover:border-muted-foreground/50 hover:shadow-[var(--shadow-card-hover)]'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              {/* Selection Glow Effect */}
              {isSelected && (
                <div className={`absolute inset-0 bg-gradient-to-r from-${type.themeColor}/5 to-transparent opacity-50`}></div>
              )}
              
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-6">
                  {/* Icon Container */}
                  <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    isSelected 
                      ? `bg-${type.themeColor}/20 shadow-[var(--shadow-glow)]` 
                      : 'bg-muted/50 group-hover:bg-muted'
                  }`}>
                    <Icon className={`h-7 w-7 transition-all duration-300 ${
                      isSelected ? `text-${type.themeColor}` : 'text-muted-foreground group-hover:text-foreground'
                    }`} />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle2 className={`h-5 w-5 text-${type.themeColor} bg-background rounded-full`} />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-xl font-bold transition-colors duration-300 ${
                            isSelected ? `text-${type.themeColor}` : 'text-foreground'
                          }`}>
                            {type.name}
                          </h3>
                          <Badge variant={isSelected ? "default" : "secondary"} className={`text-xs font-medium ${
                            isSelected ? `bg-${type.themeColor}/20 text-${type.themeColor} border-${type.themeColor}/30` : ''
                          }`}>
                            {type.badge}
                          </Badge>
                        </div>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                          isSelected ? 'text-foreground/90' : 'text-muted-foreground'
                        }`}>
                          {type.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {type.details.map((detail, index) => (
                        <div key={index} className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? `bg-${type.themeColor}/10 border border-${type.themeColor}/20` 
                            : 'bg-muted/30 border border-transparent group-hover:bg-muted/50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
                            isSelected ? `bg-${type.themeColor}` : 'bg-muted-foreground/50'
                          }`}></div>
                          <span className={`text-xs font-medium leading-tight transition-colors duration-300 ${
                            isSelected ? 'text-foreground/90' : 'text-muted-foreground group-hover:text-foreground/80'
                          }`}>
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};