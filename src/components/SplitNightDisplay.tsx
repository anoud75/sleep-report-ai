import { Calendar, Activity, TrendingUp, Stethoscope, Heart, Droplet } from "lucide-react";

interface SplitNightDisplayProps {
  editableData: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: string) => void;
  EditableField: any;
}

export const SplitNightDisplay = ({ 
  editableData, 
  isEditMode, 
  handleFieldChange,
  EditableField 
}: SplitNightDisplayProps) => {
  
  // Three-column grid row component
  const ThreeColumnRow = ({ label, offValue, onValue, fieldOff, fieldOn }: any) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground font-inter">{label}</span>
      <div className="text-center">
        <EditableField
          value={offValue}
          field={fieldOff}
          isEditMode={isEditMode}
          onChange={handleFieldChange}
          type="number"
          className="font-medium text-foreground font-inter text-center"
        />
      </div>
      <div className="text-center">
        <EditableField
          value={onValue}
          field={fieldOn}
          isEditMode={isEditMode}
          onChange={handleFieldChange}
          type="number"
          className="font-medium text-foreground font-inter text-center"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sleep Timing - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-trust protocol-icon" />
          Sleep Timing
        </h3>
        <div className="space-y-1">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Events</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          {/* Data Rows */}
          <ThreeColumnRow 
            label="Light off" 
            offValue={editableData.offCpap.lightsOff} 
            onValue={editableData.onCpap.lightsOff}
            fieldOff="offCpap.lightsOff"
            fieldOn="onCpap.lightsOff"
          />
          <ThreeColumnRow 
            label="Light on" 
            offValue={editableData.offCpap.lightsOn} 
            onValue={editableData.onCpap.lightsOn}
            fieldOff="offCpap.lightsOn"
            fieldOn="onCpap.lightsOn"
          />
          <ThreeColumnRow 
            label="Time in Bed (min)" 
            offValue={editableData.offCpap.timeInBed} 
            onValue={editableData.onCpap.timeInBed}
            fieldOff="offCpap.timeInBed"
            fieldOn="onCpap.timeInBed"
          />
          <ThreeColumnRow 
            label="Total Sleep Time (min)" 
            offValue={editableData.offCpap.totalSleepTime} 
            onValue={editableData.onCpap.totalSleepTime}
            fieldOff="offCpap.totalSleepTime"
            fieldOn="onCpap.totalSleepTime"
          />
          
          {/* CPAP Row - special formatting */}
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
            <span className="text-sm text-muted-foreground font-inter">CPAP/BPAP/O2</span>
            <div className="text-center font-medium text-foreground">---</div>
            <div className="text-center">
              <EditableField
                value={editableData.onCpap.cpapPressure}
                field="onCpap.cpapPressure"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="text"
                className="font-medium text-foreground font-inter text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Quality - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-trust protocol-icon" />
          Sleep Quality
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Metric</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          <ThreeColumnRow 
            label="Sleep Latency (min)" 
            offValue={editableData.offCpap.sleepLatency} 
            onValue={editableData.onCpap.sleepLatency}
            fieldOff="offCpap.sleepLatency"
            fieldOn="onCpap.sleepLatency"
          />
          <ThreeColumnRow 
            label="REM Latency (min)" 
            offValue={editableData.offCpap.remLatency} 
            onValue={editableData.onCpap.remLatency}
            fieldOff="offCpap.remLatency"
            fieldOn="onCpap.remLatency"
          />
          <ThreeColumnRow 
            label="Sleep Efficiency (%)" 
            offValue={editableData.offCpap.sleepEfficiency} 
            onValue={editableData.onCpap.sleepEfficiency}
            fieldOff="offCpap.sleepEfficiency"
            fieldOn="onCpap.sleepEfficiency"
          />
        </div>
      </div>

      {/* Sleep Architecture - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-trust protocol-icon" />
          Sleep Architecture
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Stage</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          <ThreeColumnRow 
            label="Sleep Stage 1 (%)" 
            offValue={editableData.offCpap.stage1Percent} 
            onValue={editableData.onCpap.stage1Percent}
            fieldOff="offCpap.stage1Percent"
            fieldOn="onCpap.stage1Percent"
          />
          <ThreeColumnRow 
            label="Sleep Stage 2 (%)" 
            offValue={editableData.offCpap.stage2Percent} 
            onValue={editableData.onCpap.stage2Percent}
            fieldOff="offCpap.stage2Percent"
            fieldOn="onCpap.stage2Percent"
          />
          <ThreeColumnRow 
            label="Slow Wave Sleep (%)" 
            offValue={editableData.offCpap.slowWaveSleepPercent} 
            onValue={editableData.onCpap.slowWaveSleepPercent}
            fieldOff="offCpap.slowWaveSleepPercent"
            fieldOn="onCpap.slowWaveSleepPercent"
          />
          <ThreeColumnRow 
            label="REM Sleep (%)" 
            offValue={editableData.offCpap.remPercent} 
            onValue={editableData.onCpap.remPercent}
            fieldOff="offCpap.remPercent"
            fieldOn="onCpap.remPercent"
          />
          <ThreeColumnRow 
            label="REM Cycle (No. of cycles)" 
            offValue={editableData.offCpap.remCycles} 
            onValue={editableData.onCpap.remCycles}
            fieldOff="offCpap.remCycles"
            fieldOn="onCpap.remCycles"
          />
        </div>
      </div>

      {/* Respiratory Events - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-trust protocol-icon" />
          Respiratory Events
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Event Type</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
            <span className="text-sm text-muted-foreground font-inter">AHI (NREM/REM)</span>
            <div className="text-center font-medium text-foreground">{editableData.offCpap.ahiNremRem}</div>
            <div className="text-center font-medium text-foreground">{editableData.onCpap.ahiNremRem}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
            <span className="text-sm text-muted-foreground font-inter">AHI (supine/lateral) (/hr)</span>
            <div className="text-center font-medium text-foreground">{editableData.offCpap.ahiSupineLateral}</div>
            <div className="text-center font-medium text-foreground">{editableData.onCpap.ahiSupineLateral}</div>
          </div>
          <ThreeColumnRow 
            label="Central Apnea Index" 
            offValue={editableData.offCpap.centralApneaIndex} 
            onValue={editableData.onCpap.centralApneaIndex}
            fieldOff="offCpap.centralApneaIndex"
            fieldOn="onCpap.centralApneaIndex"
          />
          <ThreeColumnRow 
            label="Obstructive Apnea Index (/hr)" 
            offValue={editableData.offCpap.obstructiveApneaIndex} 
            onValue={editableData.onCpap.obstructiveApneaIndex}
            fieldOff="offCpap.obstructiveApneaIndex"
            fieldOn="onCpap.obstructiveApneaIndex"
          />
          <ThreeColumnRow 
            label="Mixed Apnea Index" 
            offValue={editableData.offCpap.mixedApneaIndex} 
            onValue={editableData.onCpap.mixedApneaIndex}
            fieldOff="offCpap.mixedApneaIndex"
            fieldOn="onCpap.mixedApneaIndex"
          />
          <ThreeColumnRow 
            label="Hypopnea Index (/hr)" 
            offValue={editableData.offCpap.hypopneaIndex} 
            onValue={editableData.onCpap.hypopneaIndex}
            fieldOff="offCpap.hypopneaIndex"
            fieldOn="onCpap.hypopneaIndex"
          />
          <ThreeColumnRow 
            label="Hypopnea Mean Duration (sec)" 
            offValue={editableData.offCpap.meanHypopneaDuration} 
            onValue={editableData.onCpap.meanHypopneaDuration}
            fieldOff="offCpap.meanHypopneaDuration"
            fieldOn="onCpap.meanHypopneaDuration"
          />
        </div>
      </div>

      {/* Cardiac Data - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-trust protocol-icon" />
          Cardiac Data
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Metric</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
            <span className="text-sm text-muted-foreground font-inter">Heart Rate (NREM/REM)</span>
            <div className="text-center font-medium text-foreground">
              {editableData.offCpap.heartRateNremRem === 0 || editableData.offCpap.heartRateNremRem === '0' ? '---' : (editableData.offCpap.heartRateNremRem || '---')}
            </div>
            <div className="text-center font-medium text-foreground">
              {editableData.onCpap.heartRateNremRem === 0 || editableData.onCpap.heartRateNremRem === '0' ? '---' : (editableData.onCpap.heartRateNremRem || '---')}
            </div>
          </div>
        </div>
      </div>

      {/* Oxygenation - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <Droplet className="h-4 w-4 text-trust protocol-icon" />
          Oxygen Saturation
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Metric</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          <ThreeColumnRow 
            label="Desaturation Index (/hr)" 
            offValue={editableData.offCpap.desaturationIndex} 
            onValue={editableData.onCpap.desaturationIndex}
            fieldOff="offCpap.desaturationIndex"
            fieldOn="onCpap.desaturationIndex"
          />
          <ThreeColumnRow 
            label="% Time with O2 < 90% (%)" 
            offValue={editableData.offCpap.timeBelow90} 
            onValue={editableData.onCpap.timeBelow90}
            fieldOff="offCpap.timeBelow90"
            fieldOn="onCpap.timeBelow90"
          />
          <ThreeColumnRow 
            label="% Time with O2 < 95% (%)" 
            offValue={editableData.offCpap.timeBelow95} 
            onValue={editableData.onCpap.timeBelow95}
            fieldOff="offCpap.timeBelow95"
            fieldOn="onCpap.timeBelow95"
          />
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
            <span className="text-sm text-muted-foreground font-inter">Lowest O2 /Average O2</span>
            <div className="text-center font-medium text-foreground">{editableData.offCpap.lowestO2Average}</div>
            <div className="text-center font-medium text-foreground">{editableData.onCpap.lowestO2Average}</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics - Three Columns */}
      <div className="bg-background rounded-xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-trust protocol-icon" />
          Additional Metrics
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-border mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Metric</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">OFF CPAP</span>
            <span className="text-sm font-semibold text-muted-foreground text-center">ON CPAP</span>
          </div>
          <ThreeColumnRow 
            label="Arousal Index (/hr)" 
            offValue={editableData.offCpap.arousalIndex} 
            onValue={editableData.onCpap.arousalIndex}
            fieldOff="offCpap.arousalIndex"
            fieldOn="onCpap.arousalIndex"
          />
          <ThreeColumnRow 
            label="Snoring (%)" 
            offValue={editableData.offCpap.snoring} 
            onValue={editableData.onCpap.snoring}
            fieldOff="offCpap.snoring"
            fieldOn="onCpap.snoring"
          />
          <ThreeColumnRow 
            label="Leg Movement Index (/hr)" 
            offValue={editableData.offCpap.legMovementIndex} 
            onValue={editableData.onCpap.legMovementIndex}
            fieldOff="offCpap.legMovementIndex"
            fieldOn="onCpap.legMovementIndex"
          />
        </div>
      </div>
    </div>
  );
};
