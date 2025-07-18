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
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    details: ['Complete polysomnography', 'Sleep architecture analysis', 'Respiratory event scoring']
  },
  {
    id: 'Titration',
    name: 'Titration',
    description: 'CPAP therapy used throughout the night',
    icon: Zap,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    details: ['CPAP pressure optimization', 'Leak assessment', 'Efficacy evaluation']
  },
  {
    id: 'Split-Night',
    name: 'Split-Night',
    description: 'Hybrid study combining diagnostic and CPAP phases',
    icon: GitBranch,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
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
                {/* Clean Header */}
                <div className={`h-16 relative ${type.bgColor} border-b border-border`}>
                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
                        <Icon className={`h-5 w-5 ${type.iconColor}`} />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">{type.name}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                  
                  <div className="space-y-1">
                    {type.details.map((detail, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
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