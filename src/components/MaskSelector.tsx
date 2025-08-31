import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wind, Settings } from "lucide-react";

interface MaskSelectorProps {
  onMaskDataChange: (data: any) => void;
}

const maskTypes = [
  { value: 'nasal', label: 'Nasal Mask', description: 'Covers nose only' },
  { value: 'oronasal', label: 'Oronasal (Full Face)', description: 'Covers nose and mouth' },
  { value: 'nasal_pillows', label: 'Nasal Pillows', description: 'Direct nasal contact' },
  { value: 'full_face', label: 'Full Face', description: 'Complete coverage' }
];

const maskSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'extra_large', label: 'Extra Large' }
];

export const MaskSelector = ({ onMaskDataChange }: MaskSelectorProps) => {
  const [maskType, setMaskType] = useState<string>('');
  const [maskSize, setMaskSize] = useState<string>('');
  const [hasHeadgear, setHasHeadgear] = useState(false);
  const [hasChinstrap, setHasChinstrap] = useState(false);

  const updateMaskData = (updates: any) => {
    const newData = {
      maskType,
      maskSize,
      hasHeadgear,
      hasChinstrap,
      ...updates
    };

    // Only call onChange if we have the required fields
    if (newData.maskType && newData.maskSize) {
      onMaskDataChange(newData);
    } else {
      onMaskDataChange(null);
    }
  };

  const handleMaskTypeChange = (value: string) => {
    setMaskType(value);
    updateMaskData({ maskType: value });
  };

  const handleMaskSizeChange = (value: string) => {
    setMaskSize(value);
    updateMaskData({ maskSize: value });
  };

  const handleHeadgearChange = (checked: boolean) => {
    setHasHeadgear(checked);
    updateMaskData({ hasHeadgear: checked });
  };

  const handleChinstrapChange = (checked: boolean) => {
    setHasChinstrap(checked);
    updateMaskData({ hasChinstrap: checked });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          CPAP/BPAP Mask Configuration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please specify the mask details used during titration
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mask Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Mask Type *</Label>
          <Select value={maskType} onValueChange={handleMaskTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select mask type" />
            </SelectTrigger>
            <SelectContent>
              {maskTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mask Size Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Mask Size *</Label>
          <Select value={maskSize} onValueChange={handleMaskSizeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select mask size" />
            </SelectTrigger>
            <SelectContent>
              {maskSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Accessories */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Additional Accessories
          </Label>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Headgear Switch */}
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
              <Switch
                id="headgear"
                checked={hasHeadgear}
                onCheckedChange={handleHeadgearChange}
              />
              <Label htmlFor="headgear" className="text-sm">
                Headgear
              </Label>
            </div>

            {/* Chinstrap Switch */}
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
              <Switch
                id="chinstrap"
                checked={hasChinstrap}
                onCheckedChange={handleChinstrapChange}
              />
              <Label htmlFor="chinstrap" className="text-sm">
                Chinstrap
              </Label>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        {maskType && maskSize && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <h4 className="text-sm font-medium text-success mb-2">Configuration Summary</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-success/30 text-success">
                {maskTypes.find(t => t.value === maskType)?.label}
              </Badge>
              <Badge variant="outline" className="border-success/30 text-success">
                Size: {maskSizes.find(s => s.value === maskSize)?.label}
              </Badge>
              {hasHeadgear && (
                <Badge variant="outline" className="border-success/30 text-success">
                  + Headgear
                </Badge>
              )}
              {hasChinstrap && (
                <Badge variant="outline" className="border-success/30 text-success">
                  + Chinstrap
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};