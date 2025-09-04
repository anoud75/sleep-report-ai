import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Wind, Activity, Pill, Settings, MessageSquare } from "lucide-react";

interface ClinicalDataEntryProps {
  onDataChange: (data: any) => void;
  studyType: string;
}

const maskTypes = [
  { value: 'resmed_airfit_f20', label: 'Resmed AirFit F20 Full Face Mask', description: 'Full face coverage' },
  { value: 'resmed_airfit_n20', label: 'Resmed AirFit N20 Nasal Mask', description: 'Nasal coverage' },
  { value: 'resmed_airfit_n30', label: 'Resmed AirFit N30 Nasal Pillows', description: 'Nasal pillows' },
  { value: 'resmed_airfit_f10', label: 'Resmed AirFit F10 Full Face Mask', description: 'Full face coverage' },
  { value: 'nonvented_resmed_full_face', label: 'Nonvented Resmed Full Face Mask', description: 'Non-vented full face' },
  { value: 'amara_gel_full_face', label: 'Amara Gel Full Face Mask', description: 'Gel cushion full face' },
  { value: 'amara_full_face', label: 'Amara Full Face Mask', description: 'Standard full face' },
  { value: 'amara_view_full_face', label: 'Amara View Full Face Mask', description: 'Clear view full face' },
  { value: 'comfort_gel_blue_full_face', label: 'Comfort Gel Blue Full Face Mask', description: 'Blue gel cushion' },
  { value: 'comfortgel_nasal', label: 'ComfortGel Nasal Mask', description: 'Gel nasal mask' },
  { value: 'dreamwear_full_face', label: 'DreamWear Full Face Mask', description: 'Under-nose full face' },
  { value: 'dreamwear_gel_nasal_pillow', label: 'DreamWear Gel Nasal Pillow', description: 'Gel nasal pillows' },
  { value: 'dreamwear_nasal', label: 'DreamWear Nasal Mask', description: 'Under-nose nasal' },
  { value: 'true_blue_nasal', label: 'True Blue Nasal Mask', description: 'Blue nasal mask' },
  { value: 'wisp_minimal_nasal', label: 'Wisp Minimal Contact Nasal Mask', description: 'Minimal contact nasal' }
];

const maskSizes = [
  { value: 'petite', label: 'PETITE' },
  { value: 'small', label: 'SMALL' },
  { value: 'medium_small', label: 'MEDIUM/SMALL' },
  { value: 'medium', label: 'MEDIUM' },
  { value: 'medium_wide', label: 'MEDIUM/WIDE' },
  { value: 'large', label: 'LARGE' },
  { value: 'x_large', label: 'X LARGE' }
];

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

export const ClinicalDataEntry = ({ onDataChange, studyType }: ClinicalDataEntryProps) => {
  // Mask data
  const [maskType, setMaskType] = useState<string>('');
  const [maskSize, setMaskSize] = useState<string>('');
  
  const [hasChinstrap, setHasChinstrap] = useState(false);
  const [hasHeatedHumidifier, setHasHeatedHumidifier] = useState(false);

  // Study information
  const [isRepeatedStudy, setIsRepeatedStudy] = useState(false);
  const [oxygenUsed, setOxygenUsed] = useState(false);
  const [oxygenLiters, setOxygenLiters] = useState<string>('');

  // Pressure data (required for titration/split-night)
  const [cpapPressure, setCpapPressure] = useState<string>('');
  const [bpapUsed, setBpapUsed] = useState(false);
  const [ipapPressure, setIpapPressure] = useState<string>('');
  const [epapPressure, setEpapPressure] = useState<string>('');

  // Optional clinical data
  const [etco2Awake, setEtco2Awake] = useState<string>('');
  const [etco2Nrem, setEtco2Nrem] = useState<string>('');
  const [etco2Rem, setEtco2Rem] = useState<string>('');
  const [tcco2Awake, setTcco2Awake] = useState<string>('');
  const [tcco2Nrem, setTcco2Nrem] = useState<string>('');
  const [tcco2Rem, setTcco2Rem] = useState<string>('');
  const [medication, setMedication] = useState<string>('');
  
  // Patient comments
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  const requiresPressureData = studyType === 'Titration' || studyType === 'Split-Night';
  const isTherapeuticOrSplitNight = studyType === 'Titration' || studyType === 'Split-Night';

  const updateData = (updates: any = {}) => {
    const newData = {
      // Mask data
      maskType,
      maskSize,
      hasChinstrap,
      hasHeatedHumidifier: isTherapeuticOrSplitNight ? hasHeatedHumidifier : false,
      // Study information
      isRepeatedStudy,
      oxygenUsed: isTherapeuticOrSplitNight ? oxygenUsed : false,
      oxygenLiters: (isTherapeuticOrSplitNight && oxygenUsed) ? oxygenLiters : '',
      // Pressure data
      cpapPressure,
      bpapUsed,
      ipapPressure: bpapUsed ? ipapPressure : '',
      epapPressure: bpapUsed ? epapPressure : '',
      // Optional clinical data
      etco2: {
        awake: etco2Awake,
        nrem: etco2Nrem,
        rem: etco2Rem
      },
      tcco2: {
        awake: tcco2Awake,
        nrem: tcco2Nrem,
        rem: tcco2Rem
      },
      medication,
      // Patient comments
      selectedComments,
      ...updates
    };

    // Check if required fields are filled
    const hasRequiredMaskData = newData.maskType && newData.maskSize;
    const hasRequiredPressureData = requiresPressureData ? 
      (bpapUsed ? (newData.ipapPressure && newData.epapPressure) : newData.cpapPressure) : true;

    if (hasRequiredMaskData && hasRequiredPressureData) {
      onDataChange(newData);
    } else {
      onDataChange(null);
    }
  };

  return (
    <div className="medical-card rounded-2xl border-trust/20 bg-black/60 backdrop-blur-xl">
      <div className="text-center p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold font-jakarta glow-text text-white mb-2 flex items-center justify-center gap-2">
          <Wind className="h-5 w-5 text-trust protocol-icon" />
          Clinical Data Entry
        </h2>
        <p className="text-white/70 font-inter">
          {requiresPressureData 
            ? "CPAP/BPAP pressure and mask details are required for this study type"
            : "Mask configuration and clinical parameters (optional)"
          }
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Mask Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-trust protocol-icon" />
            <label className="text-base font-semibold font-jakarta text-white">Mask Configuration</label>
            {requiresPressureData && <Badge className="text-xs bg-trust/20 text-trust border-trust/30">Required</Badge>}
          </div>

          {/* Mask Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-inter text-white">Mask Type *</label>
            <Select value={maskType} onValueChange={(value) => { setMaskType(value); updateData({ maskType: value }); }}>
              <SelectTrigger className="w-full bg-white/5 border-white/20 text-white hover:border-trust/50 transition-colors">
                <SelectValue placeholder="Select mask type" className="text-white/70" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                {maskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-trust/10 focus:bg-trust/10">
                    <div className="flex flex-col">
                      <span className="font-medium font-inter text-white">{type.label}</span>
                      <span className="text-xs text-white/70">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mask Size Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-inter text-white">Mask Size *</label>
            <Select value={maskSize} onValueChange={(value) => { setMaskSize(value); updateData({ maskSize: value }); }}>
              <SelectTrigger className="w-full bg-white/5 border-white/20 text-white hover:border-trust/50 transition-colors">
                <SelectValue placeholder="Select mask size" className="text-white/70" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                {maskSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value} className="text-white hover:bg-trust/10 focus:bg-trust/10">
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Accessories */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
            <Switch
              id="chinstrap"
              checked={hasChinstrap}
              onCheckedChange={(checked) => { setHasChinstrap(checked); updateData({ hasChinstrap: checked }); }}
            />
            <label htmlFor="chinstrap" className="text-sm font-inter text-white">Chinstrap</label>
          </div>

          {/* Heated Humidifier for Therapeutic/Split-Night Studies */}
          {isTherapeuticOrSplitNight && (
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
              <Switch
                id="heated-humidifier"
                checked={hasHeatedHumidifier}
                onCheckedChange={(checked) => { setHasHeatedHumidifier(checked); updateData({ hasHeatedHumidifier: checked }); }}
              />
              <label htmlFor="heated-humidifier" className="text-sm font-inter text-white">Heated Humidifier</label>
            </div>
          )}
        </div>

        {/* Study Information Section */}
        <Separator className="border-white/20" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-trust protocol-icon" />
            <label className="text-base font-semibold font-jakarta text-white">Study Information</label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 bg-white/5">
            <Switch
              id="repeated-study"
              checked={isRepeatedStudy}
              onCheckedChange={(checked) => { setIsRepeatedStudy(checked); updateData({ isRepeatedStudy: checked }); }}
            />
            <label htmlFor="repeated-study" className="text-sm text-white font-inter">Repeated Study</label>
          </div>

          {/* Oxygen Usage for Therapeutic/Split-Night Studies */}
          {isTherapeuticOrSplitNight && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 bg-white/5">
                <Switch
                  id="oxygen-used"
                  checked={oxygenUsed}
                  onCheckedChange={(checked) => { setOxygenUsed(checked); updateData({ oxygenUsed: checked }); }}
                />
                <label htmlFor="oxygen-used" className="text-sm text-white font-inter">O2 Used</label>
              </div>
              
              {oxygenUsed && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white font-inter">Liters per minute</label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    value={oxygenLiters}
                    onChange={(e) => { setOxygenLiters(e.target.value); updateData({ oxygenLiters: e.target.value }); }}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patient Comments Section */}
        <Separator className="border-white/20" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-trust protocol-icon" />
            <label className="text-base font-semibold text-white font-jakarta">Patient Comments</label>
            <Badge className="text-xs bg-white/10 text-white/70 border-white/20">Optional</Badge>
          </div>
          <p className="text-xs text-white/70 font-inter">
            Select multiple comments that apply to this patient
          </p>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/5 border-white/20 text-white hover:bg-white/10">
                <MessageSquare className="mr-2 h-4 w-4" />
                {selectedComments.length === 0
                  ? "Select patient comments..."
                  : `${selectedComments.length} comment${selectedComments.length > 1 ? 's' : ''} selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-3 bg-black/90 border-white/20 backdrop-blur-xl z-50" align="start">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {patientComments.map((comment) => (
                  <div key={comment.value} className="flex items-start space-x-3">
                    <Checkbox
                      id={comment.value}
                      checked={selectedComments.includes(comment.value)}
                      onCheckedChange={(checked) => {
                        const newComments = checked 
                          ? [...selectedComments, comment.value]
                          : selectedComments.filter(c => c !== comment.value);
                        setSelectedComments(newComments);
                        updateData({ selectedComments: newComments });
                      }}
                    />
                    <label htmlFor={comment.value} className="text-sm cursor-pointer leading-relaxed text-white font-inter">
                      {comment.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Pressure Configuration Section */}
        {requiresPressureData && (
          <>
            <Separator className="border-white/20" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-trust protocol-icon" />
                <label className="text-base font-semibold text-white font-jakarta">Pressure Settings</label>
                <Badge className="text-xs bg-trust/20 text-trust border-trust/30">Required</Badge>
              </div>

              {/* BPAP Toggle */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 bg-white/5">
                <Switch
                  id="bpap"
                  checked={bpapUsed}
                  onCheckedChange={(checked) => { setBpapUsed(checked); updateData({ bpapUsed: checked }); }}
                />
                <label htmlFor="bpap" className="text-sm font-medium text-white font-inter">BPAP Used (instead of CPAP)</label>
              </div>

              {bpapUsed ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white font-inter">IPAP Pressure (cmH2O) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 12"
                      value={ipapPressure}
                      onChange={(e) => { setIpapPressure(e.target.value); updateData({ ipapPressure: e.target.value }); }}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white font-inter">EPAP Pressure (cmH2O) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 8"
                      value={epapPressure}
                      onChange={(e) => { setEpapPressure(e.target.value); updateData({ epapPressure: e.target.value }); }}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white font-inter">CPAP Pressure (cmH2O) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={cpapPressure}
                    onChange={(e) => { setCpapPressure(e.target.value); updateData({ cpapPressure: e.target.value }); }}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Optional Clinical Parameters */}
        <Separator className="border-white/20" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-white/70" />
            <label className="text-base font-semibold text-white/70 font-jakarta">Optional Clinical Data</label>
            <Badge className="text-xs bg-white/10 text-white/70 border-white/20">Optional</Badge>
          </div>
          <p className="text-xs text-white/70 font-inter">
            These parameters are not extracted from uploaded files and must be entered manually if available
          </p>

          {/* EtCO2 Values */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white font-inter">EtCO2 (mmHg)</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-inter">Awake</label>
                <Input
                  placeholder="e.g., 35"
                  value={etco2Awake}
                  onChange={(e) => { setEtco2Awake(e.target.value); updateData({ etco2Awake: e.target.value }); }}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-inter">NREM</label>
                <Input
                  placeholder="e.g., 38"
                  value={etco2Nrem}
                  onChange={(e) => { setEtco2Nrem(e.target.value); updateData({ etco2Nrem: e.target.value }); }}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-inter">REM</label>
                <Input
                  placeholder="e.g., 40"
                  value={etco2Rem}
                  onChange={(e) => { setEtco2Rem(e.target.value); updateData({ etco2Rem: e.target.value }); }}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                />
              </div>
            </div>
          </div>

          {/* TcCO2 Values */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white font-inter">TcCO2 (mmHg)</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-inter">Awake</label>
                <Input
                  placeholder="e.g., 45"
                  value={tcco2Awake}
                  onChange={(e) => { setTcco2Awake(e.target.value); updateData({ tcco2Awake: e.target.value }); }}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-inter">NREM</label>
                <Input
                  placeholder="e.g., 47"
                  value={tcco2Nrem}
                  onChange={(e) => { setTcco2Nrem(e.target.value); updateData({ tcco2Nrem: e.target.value }); }}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-inter">REM</label>
                <Input
                  placeholder="e.g., 48"
                  value={tcco2Rem}
                  onChange={(e) => { setTcco2Rem(e.target.value); updateData({ tcco2Rem: e.target.value }); }}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
                />
              </div>
            </div>
          </div>

          {/* Medication */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white font-inter">Medication</label>
            <Textarea
              placeholder="e.g., Tab. Zolpidem 10mg at 10:30 PM"
              value={medication}
              onChange={(e) => { setMedication(e.target.value); updateData({ medication: e.target.value }); }}
              rows={2}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-trust"
            />
          </div>
        </div>

        {/* Configuration Summary */}
        {maskType && maskSize && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <h4 className="text-sm font-medium text-success mb-2 font-jakarta">Configuration Summary</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-success/30 text-success bg-success/10">
                {maskTypes.find(t => t.value === maskType)?.label}
              </Badge>
              <Badge className="border-success/30 text-success bg-success/10">
                Size: {maskSizes.find(s => s.value === maskSize)?.label}
              </Badge>
              {requiresPressureData && (
                <>
                  {bpapUsed ? (
                    ipapPressure && epapPressure && (
                      <Badge className="border-success/30 text-success bg-success/10">
                        BPAP: {ipapPressure}/{epapPressure} cmH2O
                      </Badge>
                    )
                  ) : (
                    cpapPressure && (
                      <Badge className="border-success/30 text-success bg-success/10">
                        CPAP: {cpapPressure} cmH2O
                      </Badge>
                    )
                  )}
                </>
              )}
              {hasChinstrap && (
                <Badge className="border-success/30 text-success bg-success/10">
                  + Chinstrap
                </Badge>
              )}
              {isTherapeuticOrSplitNight && hasHeatedHumidifier && (
                <Badge className="border-success/30 text-success bg-success/10">
                  + Heated Humidifier
                </Badge>
              )}
              {isRepeatedStudy && (
                <Badge className="border-success/30 text-success bg-success/10">
                  Repeated Study
                </Badge>
              )}
              {isTherapeuticOrSplitNight && oxygenUsed && oxygenLiters && (
                <Badge className="border-success/30 text-success bg-success/10">
                  O2: {oxygenLiters} L/min
                </Badge>
              )}
              {selectedComments.length > 0 && (
                <Badge className="border-success/30 text-success bg-success/10">
                  {selectedComments.length} Comment{selectedComments.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};