import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, User, Calendar, Activity, Stethoscope, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface ProcessedResultsProps {
  data: any;
  onNewReport: () => void;
}

export const ProcessedResults = ({ data, onNewReport }: ProcessedResultsProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sleep Study Report', 20, 30);
    
    // Add patient info
    doc.setFontSize(12);
    doc.text(`Patient: ${data.patientInfo?.name || 'N/A'}`, 20, 50);
    doc.text(`Study Date: ${data.patientInfo?.studyDate || 'N/A'}`, 20, 60);
    doc.text(`Study Type: ${data.patientInfo?.studyType || data.studyType || 'N/A'}`, 20, 70);
    
    // Add sleep data
    let yPosition = 90;
    doc.setFontSize(14);
    doc.text('Sleep Study Results:', 20, yPosition);
    
    yPosition += 20;
    doc.setFontSize(10);
    
    // Display all the extracted data
    const fields = [
      ['Light Off', data.lightOff],
      ['Light On', data.lightOn],
      ['Time in Bed (min)', data.timeInBed],
      ['Total Sleep Time (min)', data.totalSleepTime],
      ['CPAP/BPAP/O2', data.cpapBpapO2],
      ['Sleep Latency (min)', data.sleepLatency],
      ['REM Latency (min)', data.remLatency],
      ['Sleep Efficiency (%)', data.sleepEfficiency],
      ['Sleep Stage 1 (%)', data.stage1],
      ['Sleep Stage 2 (%)', data.stage2],
      ['Slow Wave Sleep (%)', data.slowWave],
      ['REM Sleep (%)', data.rem],
      ['AHI (NREM/REM)', data.ahiNremRem],
      ['AHI (supine/lateral)', data.ahiSupineLateral],
      ['Central Apnea Index', data.centralApneaIndex],
      ['Obstructive Apnea Index (/hr)', data.obstructiveApneaIndex],
      ['Mixed Apnea Index', data.mixedApneaIndex],
      ['Hypopnea Index (/hr)', data.hypopneaIndex],
      ['Hypopnea Mean Duration (sec)', data.hypopneaMeanDuration],
      ['Heart Rate (NREM/REM)', data.heartRateNremRem],
      ['Desaturation Index (/hr)', data.desaturationIndex],
      ['% Time with O2 < 90%', data.timeO2Below90],
      ['% Time with O2 < 95%', data.timeO2Below95],
      ['Lowest O2 / Average O2', data.lowestO2AverageO2],
      ['Arousal Index (/hr)', data.arousalIndex],
      ['Snoring (%)', data.snoring],
      ['Leg Movement Index (/hr)', data.legMovementIndex]
    ];
    
    fields.forEach(([label, value]) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${label}: ${value || '---'}`, 20, yPosition);
      yPosition += 10;
    });
    
    // Add summary
    if (data.summary && yPosition < 250) {
      yPosition += 10;
      doc.setFontSize(12);
      doc.text('Summary:', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const splitSummary = doc.splitTextToSize(data.summary, 170);
      doc.text(splitSummary, 20, yPosition);
    }
    
    doc.save(`sleep-study-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your sleep study report has been downloaded.",
    });
  };

  const handlePreviewReport = () => {
    toast({
      title: "Preview Opened",
      description: "Report preview will open in a new window.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Sleep Study Analysis Complete</span>
              </CardTitle>
              <CardDescription>
                Report generated for {data.patientInfo.name} • {data.patientInfo.studyDate}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="h-3 w-3 mr-1" />
              {data.studyType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button onClick={handleDownloadPDF} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={handlePreviewReport}>
              Preview
            </Button>
            <Button variant="outline" onClick={onNewReport}>
              New Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Sleep Study Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sleep Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Sleep Timing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Light Off</span>
              <span className="font-medium">{data.lightOff || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Light On</span>
              <span className="font-medium">{data.lightOn || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Time in Bed (min)</span>
              <span className="font-medium">{data.timeInBed || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Sleep Time (min)</span>
              <span className="font-medium">{data.totalSleepTime || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CPAP/BPAP/O2</span>
              <span className="font-medium">{data.cpapBpapO2 || '---'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Latency & Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Sleep Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Latency (min)</span>
              <span className="font-medium">{data.sleepLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">REM Latency (min)</span>
              <span className="font-medium">{data.remLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Efficiency (%)</span>
              <span className="font-medium">{data.sleepEfficiency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Arousal Index (/hr)</span>
              <span className="font-medium">{data.arousalIndex || '---'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Sleep Architecture</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Stage 1 (%)</span>
              <span className="font-medium">{data.stage1 || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Stage 2 (%)</span>
              <span className="font-medium">{data.stage2 || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Slow Wave Sleep (%)</span>
              <span className="font-medium">{data.slowWave || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">REM Sleep (%)</span>
              <span className="font-medium">{data.rem || '---'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Respiratory Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Respiratory Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AHI (NREM/REM)</span>
              <span className="font-medium">{data.ahiNremRem || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AHI (supine/lateral)</span>
              <span className="font-medium">{data.ahiSupineLateral || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Central Apnea Index</span>
              <span className="font-medium">{data.centralApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Obstructive Apnea Index (/hr)</span>
              <span className="font-medium">{data.obstructiveApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mixed Apnea Index</span>
              <span className="font-medium">{data.mixedApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hypopnea Index (/hr)</span>
              <span className="font-medium">{data.hypopneaIndex || '---'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Additional Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hypopnea Mean Duration (sec)</span>
              <span className="font-medium">{data.hypopneaMeanDuration || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Heart Rate (NREM/REM)</span>
              <span className="font-medium">{data.heartRateNremRem || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Desaturation Index (/hr)</span>
              <span className="font-medium">{data.desaturationIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Snoring (%)</span>
              <span className="font-medium">{data.snoring || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Leg Movement Index (/hr)</span>
              <span className="font-medium">{data.legMovementIndex || '---'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Oxygen Saturation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">% Time with O2 &lt; 90%</span>
              <span className="font-medium">{data.timeO2Below90 || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">% Time with O2 &lt; 95%</span>
              <span className="font-medium">{data.timeO2Below95 || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lowest O2 / Average O2</span>
              <span className="font-medium">{data.lowestO2AverageO2 || '---'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Generated Summary */}
      {data.summary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Clinical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};