import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, User, Calendar, Activity, Stethoscope, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useState } from "react";

interface ProcessedResultsProps {
  data: any;
  onNewReport: () => void;
}

export const ProcessedResults = ({ data, onNewReport }: ProcessedResultsProps) => {
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);

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
      ['Light Off', data.studyInfo?.lightsOff],
      ['Light On', data.studyInfo?.lightsOn],
      ['Time in Bed (min)', data.studyInfo?.timeInBed],
      ['Total Sleep Time (min)', data.studyInfo?.totalSleepTime],
      ['CPAP/BPAP/O2', data.titrationData?.pressureType]
    ];
    
    const sleepQualityFields = [
      ['Sleep Latency (min)', data.studyInfo?.sleepLatency],
      ['REM Latency (min)', data.studyInfo?.remLatency],
      ['Sleep Efficiency (%)', data.sleepArchitecture?.sleepEfficiency]
    ];
    
    const sleepStagesFields = [
      ['Sleep Stage 1 (%)', data.sleepArchitecture?.stage1Percent],
      ['Sleep Stage 2 (%)', data.sleepArchitecture?.stage2Percent],
      ['Slow Wave Sleep (%)', data.sleepArchitecture?.stage3Percent],
      ['REM Sleep (%)', data.sleepArchitecture?.remPercent]
    ];
    
    const respiratoryFields = [
      ['AHI (NREM/REM)', `${data.respiratoryEvents?.ahiNrem || '---'} / ${data.respiratoryEvents?.ahiRem || '---'}`],
      ['AHI (Supine/Lateral)', `${data.respiratoryEvents?.ahiSupine || '---'} / ${data.respiratoryEvents?.ahiLateral || '---'}`],
      ['Central Apnea Index', data.respiratoryEvents?.centralApneaIndex],
      ['Obstructive Apnea Index (/hr)', data.respiratoryEvents?.obstructiveApneaIndex],
      ['Mixed Apnea Index', data.respiratoryEvents?.mixedApneaIndex],
      ['Hypopnea Index (/hr)', data.respiratoryEvents?.hypopneaIndex],
      ['Hypopnea Mean Duration (sec)', data.respiratoryEvents?.meanHypopneaDuration]
    ];
    
    const vitalSignsFields = [
      ['Heart Rate (NREM/REM)', `${data.cardiacData?.meanHeartRateNrem || '---'} / ${data.cardiacData?.meanHeartRateRem || '---'}`],
      ['Desaturation Index (/hr)', data.oxygenation?.desaturationIndex],
      ['% Time with O2 < 90%', data.oxygenation?.timeBelow90Percent],
      ['% Time with O2 < 95%', data.oxygenation?.timeBelow95Percent],
      ['Lowest O2 / Average O2', `${data.oxygenation?.lowestSpO2 || '---'} / ${data.oxygenation?.averageSpO2 || '---'}`]
    ];
    
    const additionalFields = [
      ['Arousal Index (/hr)', data.additionalMetrics?.arousalIndex],
      ['Snoring (%)', data.additionalMetrics?.snoringPercent],
      ['Leg Movement Index (/hr)', data.additionalMetrics?.legMovementIndex]
    ];
    
    // Create sections
    yPos = createSection('Sleep Timing & Equipment', sleepTimingFields, yPos);
    yPos = createSection('Sleep Quality Metrics', sleepQualityFields, yPos);
    yPos = createSection('Sleep Architecture', sleepStagesFields, yPos);
    yPos = createSection('Respiratory Events', respiratoryFields, yPos);
    yPos = createSection('Oxygen Saturation & Heart Rate', vitalSignsFields, yPos);
    yPos = createSection('Additional Metrics', additionalFields, yPos);
    
    // Clinical Summary Section
    if (data.clinicalSummary) {
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
      const summaryLines = doc.splitTextToSize(data.clinicalSummary, contentWidth - 10);
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

    // Show feedback dialog after PDF generation
    setShowFeedback(true);
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
                Report generated for {data.patientInfo?.name || 'Patient'} • {data.studyInfo?.studyDate || 'N/A'}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="h-3 w-3 mr-1" />
              {data.studyInfo?.studyType || data.studyType || 'Diagnostic'}
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
              <span className="font-medium">{data.studyInfo?.lightsOff || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Light On</span>
              <span className="font-medium">{data.studyInfo?.lightsOn || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Time in Bed (min)</span>
              <span className="font-medium">{data.studyInfo?.timeInBed || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Sleep Time (min)</span>
              <span className="font-medium">{data.studyInfo?.totalSleepTime || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CPAP/BPAP/O2</span>
              <span className="font-medium">{data.titrationData?.pressureType || '---'}</span>
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
              <span className="font-medium">{data.studyInfo?.sleepLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">REM Latency (min)</span>
              <span className="font-medium">{data.studyInfo?.remLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Efficiency (%)</span>
              <span className="font-medium">{data.sleepArchitecture?.sleepEfficiency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Arousal Index (/hr)</span>
              <span className="font-medium">{data.additionalMetrics?.arousalIndex || '---'}</span>
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
              <span className="font-medium">{data.sleepArchitecture?.stage1Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Stage 2 (%)</span>
              <span className="font-medium">{data.sleepArchitecture?.stage2Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Slow Wave Sleep (%)</span>
              <span className="font-medium">{data.sleepArchitecture?.stage3Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">REM Sleep (%)</span>
              <span className="font-medium">{data.sleepArchitecture?.remPercent || '---'}</span>
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
              <span className="font-medium">{data.respiratoryEvents?.ahiNrem || '---'} / {data.respiratoryEvents?.ahiRem || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AHI (supine/lateral)</span>
              <span className="font-medium">{data.respiratoryEvents?.ahiSupine || '---'} / {data.respiratoryEvents?.ahiLateral || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Central Apnea Index</span>
              <span className="font-medium">{data.respiratoryEvents?.centralApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Obstructive Apnea Index (/hr)</span>
              <span className="font-medium">{data.respiratoryEvents?.obstructiveApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mixed Apnea Index</span>
              <span className="font-medium">{data.respiratoryEvents?.mixedApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hypopnea Index (/hr)</span>
              <span className="font-medium">{data.respiratoryEvents?.hypopneaIndex || '---'}</span>
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
              <span className="font-medium">{data.respiratoryEvents?.meanHypopneaDuration || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Heart Rate (NREM/REM)</span>
              <span className="font-medium">
                {data.cardiacData?.meanHeartRateNrem || '---'} / {data.cardiacData?.meanHeartRateRem || '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Desaturation Index (/hr)</span>
              <span className="font-medium">{data.oxygenation?.desaturationIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Snoring (%)</span>
              <span className="font-medium">{data.additionalMetrics?.snoringPercent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Leg Movement Index (/hr)</span>
              <span className="font-medium">{data.additionalMetrics?.legMovementIndex || '---'}</span>
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
              <span className="font-medium">{data.oxygenation?.timeBelow90Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">% Time with O2 &lt; 95%</span>
              <span className="font-medium">{data.oxygenation?.timeBelow95Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lowest O2 / Average O2</span>
              <span className="font-medium">
                {data.oxygenation?.lowestSpO2 || '---'} / {data.oxygenation?.averageSpO2 || '---'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Generated Summary */}
      {data.clinicalSummary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Clinical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.clinicalSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        reportData={data}
      />
    </div>
  );
};