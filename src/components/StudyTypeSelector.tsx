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
    bgColor: 'bg-secondary/10',
    iconColor: 'text-secondary',
    details: ['CPAP pressure optimization', 'Leak assessment', 'Efficacy evaluation']
  },
  {
    id: 'Split-Night',
    name: 'Split Night',
    description: 'Hybrid study combining diagnostic and CPAP phases',
    icon: GitBranch,
    bgColor: 'bg-accent/10',
    iconColor: 'text-accent',
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {studyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] min-h-[200px] ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              <CardContent className="p-0 relative overflow-hidden h-full flex flex-col">
                {/* Clean Header */}
                <div className={`flex-shrink-0 relative ${type.bgColor} border-b border-border`}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
                        <Icon className={`h-5 w-5 ${type.iconColor}`} />
                      </div>
                      <h4 className="font-semibold text-base text-foreground">{type.name}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                  
                  <div className="space-y-3">
                    {type.details.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground leading-relaxed">{detail}</span>
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