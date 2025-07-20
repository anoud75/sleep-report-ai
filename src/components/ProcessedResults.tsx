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
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Color scheme
    const primaryColor = [0, 123, 191] as const; // Medical blue
    const accentColor = [244, 247, 251] as const; // Light blue-gray
    const textColor = [51, 51, 51] as const; // Dark gray
    const lightGray = [128, 128, 128] as const; // Medium gray
    
    // Header with logo area and title
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('SLEEP STUDY REPORT', margin, 25);
    
    // Patient Information Section
    let yPos = 60;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', margin, yPos);
    
    // Patient info box
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(margin, yPos + 5, contentWidth, 30, 3, 3, 'F');
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${data.patientInfo?.name || 'N/A'}`, margin + 5, yPos);
    yPos += 7;
    doc.text(`Study Date: ${data.patientInfo?.studyDate || 'N/A'}`, margin + 5, yPos);
    yPos += 7;
    doc.text(`Study Type: ${data.patientInfo?.studyType || data.studyType || 'N/A'}`, margin + 5, yPos);
    
    // Sleep Study Results Section
    yPos += 25;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SLEEP STUDY RESULTS', margin, yPos);
    
    // Helper function to create a section with title and data
    const createSection = (title, fields, startY) => {
      let currentY = startY + 10;
      
      // Section title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(title, margin, currentY);
      currentY += 8;
      
      // Section border
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
      
      // Data fields
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      
      fields.forEach(([label, value]) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 40;
        }
        
        // Handle object values
        let displayValue = value || '---';
        if (typeof value === 'object' && value !== null) {
          if (value.NREM !== undefined && value.REM !== undefined) {
            displayValue = `NREM: ${value.NREM || '---'}, REM: ${value.REM || '---'}`;
          } else if (value.lowest !== undefined && value.average !== undefined) {
            displayValue = `${value.lowest || '---'} / ${value.average || '---'}`;
          } else {
            displayValue = JSON.stringify(value);
          }
        }
        
        // Label (left aligned)
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(label, margin + 2, currentY);
        
        // Value (right aligned)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        const valueWidth = doc.getTextWidth(displayValue.toString());
        doc.text(displayValue.toString(), pageWidth - margin - valueWidth - 2, currentY);
        
        currentY += 6;
      });
      
      return currentY + 5;
    };
    
    // Organize data into logical sections
    const sleepTimingFields = [
      ['Light Off', data.lightOff],
      ['Light On', data.lightOn],
      ['Time in Bed (min)', data.timeInBed],
      ['Total Sleep Time (min)', data.totalSleepTime],
      ['CPAP/BPAP/O2', data.cpapBpapO2]
    ];
    
    const sleepQualityFields = [
      ['Sleep Latency (min)', data.sleepLatency],
      ['REM Latency (min)', data.remLatency],
      ['Sleep Efficiency (%)', data.sleepEfficiency]
    ];
    
    const sleepStagesFields = [
      ['Sleep Stage 1 (%)', data.stage1],
      ['Sleep Stage 2 (%)', data.stage2],
      ['Slow Wave Sleep (%)', data.slowWave],
      ['REM Sleep (%)', data.rem]
    ];
    
    const respiratoryFields = [
      ['AHI (NREM/REM)', data.ahiNremRem],
      ['AHI (Supine/Lateral)', data.ahiSupineLateral],
      ['Central Apnea Index', data.centralApneaIndex],
      ['Obstructive Apnea Index (/hr)', data.obstructiveApneaIndex],
      ['Mixed Apnea Index', data.mixedApneaIndex],
      ['Hypopnea Index (/hr)', data.hypopneaIndex],
      ['Hypopnea Mean Duration (sec)', data.hypopneaMeanDuration]
    ];
    
    const vitalSignsFields = [
      ['Heart Rate (NREM/REM)', data.heartRateNremRem],
      ['Desaturation Index (/hr)', data.desaturationIndex],
      ['% Time with O2 < 90%', data.timeO2Below90],
      ['% Time with O2 < 95%', data.timeO2Below95],
      ['Lowest O2 / Average O2', data.lowestO2AverageO2]
    ];
    
    const additionalFields = [
      ['Arousal Index (/hr)', data.arousalIndex],
      ['Snoring (%)', data.snoring],
      ['Leg Movement Index (/hr)', data.legMovementIndex]
    ];
    
    // Create sections
    yPos = createSection('Sleep Timing & Equipment', sleepTimingFields, yPos);
    yPos = createSection('Sleep Quality Metrics', sleepQualityFields, yPos);
    yPos = createSection('Sleep Architecture', sleepStagesFields, yPos);
    yPos = createSection('Respiratory Events', respiratoryFields, yPos);
    yPos = createSection('Oxygen Saturation & Heart Rate', vitalSignsFields, yPos);
    yPos = createSection('Additional Metrics', additionalFields, yPos);
    
    // Clinical Summary Section
    if (data.summary) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 40;
      }
      
      yPos += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('CLINICAL SUMMARY', margin, yPos);
      
      // Summary box
      yPos += 10;
      const summaryLines = doc.splitTextToSize(data.summary, contentWidth - 10);
      const summaryHeight = summaryLines.length * 6 + 10;
      
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.roundedRect(margin, yPos, contentWidth, summaryHeight, 3, 3, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(summaryLines, margin + 5, yPos + 8);
    }
    
    // Footer with generation date and page numbers
    const totalPages = (doc as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
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
              <span className="font-medium">
                {typeof data.heartRateNremRem === 'object' && data.heartRateNremRem 
                  ? `NREM: ${data.heartRateNremRem.NREM || '---'}, REM: ${data.heartRateNremRem.REM || '---'}`
                  : data.heartRateNremRem || '---'}
              </span>
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
              <span className="font-medium">
                {typeof data.lowestO2AverageO2 === 'object' && data.lowestO2AverageO2 
                  ? `${data.lowestO2AverageO2.lowest || '---'} / ${data.lowestO2AverageO2.average || '---'}`
                  : data.lowestO2AverageO2 || '---'}
              </span>
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