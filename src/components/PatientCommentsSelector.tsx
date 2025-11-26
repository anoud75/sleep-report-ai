import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const patientComments = [
  { value: 'sleeping_better_center', label: 'Patient reports sleeping better in the center compared to home.' },
  { value: 'no_difference', label: 'Patient reports no difference in sleep quality between the center and home.' },
  { value: 'sleeping_better_home', label: 'Patient reports sleeping better at home.' },
  { value: 'improved_with_cpap', label: 'Patient reports improved sleep in the center with CPAP and will discuss continuation at home with the physician.' },
  { value: 'willing_cpap_home', label: 'Patient reports improved sleep in the center and expresses willingness to initiate CPAP therapy at home.' },
  { value: 'better_without_cpap', label: 'Patient reports better sleep without CPAP.' },
  { value: 'undecided_cpap', label: 'Patient remains undecided regarding the use of CPAP at home.' },
  { value: 'no_comment', label: 'No comment provided' }
];

interface PatientCommentsSelectorProps {
  onCommentsChange: (comments: string[]) => void;
}

export const PatientCommentsSelector = ({ onCommentsChange }: PatientCommentsSelectorProps) => {
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  const handleCommentToggle = (commentValue: string, checked: boolean) => {
    const newComments = checked 
      ? [...selectedComments, commentValue]
      : selectedComments.filter(c => c !== commentValue);
    setSelectedComments(newComments);
    
    // Send full label text instead of values
    const selectedLabels = newComments.map(v => 
      patientComments.find(c => c.value === v)?.label || v
    );
    onCommentsChange(selectedLabels);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <MessageSquare className="mr-2 h-4 w-4" />
          {selectedComments.length === 0
            ? "Select patient comments..."
            : `${selectedComments.length} comment${selectedComments.length > 1 ? 's' : ''} selected`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-3 z-50 bg-background border shadow-lg" align="start">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {patientComments.map((comment) => (
            <div key={comment.value} className="flex items-start space-x-3">
              <Checkbox
                id={comment.value}
                checked={selectedComments.includes(comment.value)}
                onCheckedChange={(checked) => handleCommentToggle(comment.value, checked as boolean)}
              />
              <label htmlFor={comment.value} className="text-sm cursor-pointer leading-relaxed text-foreground font-inter">
                {comment.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
