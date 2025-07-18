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
    color: 'bg-green-500',
    details: ['Complete polysomnography', 'Sleep architecture analysis', 'Respiratory event scoring']
  },
  {
    id: 'Titration',
    name: 'Titration',
    description: 'CPAP therapy used throughout the night',
    icon: Zap,
    color: 'bg-blue-500',
    details: ['CPAP pressure optimization', 'Leak assessment', 'Efficacy evaluation']
  },
  {
    id: 'Split-Night',
    name: 'Split-Night',
    description: 'Hybrid study combining diagnostic and CPAP phases',
    icon: GitBranch,
    color: 'bg-purple-500',
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
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${type.color}/10`}>
                    <Icon className={`h-5 w-5 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{type.name}</h4>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
                
                <div className="space-y-1">
                  {type.details.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span className="text-xs text-muted-foreground">{detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};