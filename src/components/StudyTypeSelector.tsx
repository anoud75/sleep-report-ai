import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, GitBranch } from "lucide-react";

interface StudyTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const studyTypes = [
  {
    id: 'Diagnostic',
    name: 'Diagnostic (PSG)',
    description: 'Baseline sleep assessment without CPAP',
    icon: Activity,
    gradient: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 70%, 45%) 100%)',
    bgColor: 'bg-diagnostic-light',
    iconColor: 'text-diagnostic',
    details: ['Complete polysomnography', 'Sleep architecture analysis', 'Respiratory event scoring']
  },
  {
    id: 'Titration',
    name: 'Titration',
    description: 'CPAP therapy used throughout the night',
    icon: Zap,
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(217, 85%, 70%) 100%)',
    bgColor: 'bg-titration-light',
    iconColor: 'text-titration',
    details: ['CPAP pressure optimization', 'Leak assessment', 'Efficacy evaluation']
  },
  {
    id: 'Split-Night',
    name: 'Split-Night',
    description: 'Hybrid study combining diagnostic and CPAP phases',
    icon: GitBranch,
    gradient: 'linear-gradient(135deg, hsl(271, 81%, 56%) 0%, hsl(271, 75%, 65%) 100%)',
    bgColor: 'bg-split-night-light',
    iconColor: 'text-split-night',
    details: ['Initial diagnostic phase', 'CPAP titration phase', 'Combined analysis']
  }
];

export const StudyTypeSelector = ({ selectedType, onTypeSelect }: StudyTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Select Study Type</h3>
        {selectedType && (
          <Badge variant="secondary">
            {studyTypes.find(type => type.id === selectedType)?.name}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {studyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              <CardContent className="p-0 relative overflow-hidden">
                {/* Gradient Header */}
                <div 
                  className="h-16 relative"
                  style={{ background: type.gradient }}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-4">
                    <h4 className="font-semibold text-sm text-white">{type.name}</h4>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{type.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {type.details.map((detail, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${type.iconColor}`}></div>
                        <span className="text-xs text-muted-foreground">{detail}</span>
                      </div>
                    ))}
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