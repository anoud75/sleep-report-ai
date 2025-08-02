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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {studyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500/30 bg-blue-500/5' 
                  : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${type.bgColor} flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${type.iconColor}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-white">{type.name}</h4>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {type.description}
                    </p>
                    
                    {/* Features list */}
                    <div className="space-y-1.5">
                      {type.details.map((detail, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-400 leading-relaxed">{detail}</span>
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