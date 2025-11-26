import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, User, Calendar, Activity, Stethoscope, TrendingUp, Brain, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useState } from "react";

interface ProcessedResultsProps {
  data: any;
  onNewReport: () => void;
}

type SeverityLevel = 'normal' | 'mild' | 'moderate' | 'severe' | null;

// Severity classification based on AASM guidelines
const getSeverityLevel = (value: number | string | null | undefined, type: string): SeverityLevel => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) return null;
  
  switch (type) {
    case 'ahi':
    case 'ahiSupine':
    case 'ahiLateral':
    case 'desaturationIndex':
      if (numValue < 5) return 'normal';
      if (numValue < 15) return 'mild';
      if (numValue < 30) return 'moderate';
      return 'severe';
      
    case 'sleepEfficiency':
      if (numValue > 85) return 'normal';
      if (numValue > 75) return 'mild';
      if (numValue > 65) return 'moderate';
      return 'severe';
      
    case 'o2Below90':
      if (numValue < 1) return 'normal';
      if (numValue < 5) return 'mild';
      if (numValue < 10) return 'moderate';
      return 'severe';
      
    case 'lowestO2':
      if (numValue > 90) return 'normal';
      if (numValue > 85) return 'mild';
      if (numValue > 80) return 'moderate';
      return 'severe';
      
    case 'arousalIndex':
    case 'legMovementIndex':
      if (numValue < 5) return 'normal';
      if (numValue < 25) return 'mild';
      if (numValue < 50) return 'moderate';
      return 'severe';
      
    case 'snoring':
      if (numValue < 10) return 'normal';
      if (numValue < 25) return 'mild';
      if (numValue < 50) return 'moderate';
      return 'severe';
      
    default:
      return null;
  }
};

// Severity Badge Component
const SeverityBadge = ({ level }: { level: SeverityLevel }) => {
  if (!level) return null;
  
  const config = {
    normal: { 
      label: 'Normal', 
      bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
      text: 'text-emerald-700 dark:text-emerald-400', 
      border: 'border-emerald-200 dark:border-emerald-800' 
    },
    mild: { 
      label: 'Mild', 
      bg: 'bg-amber-100 dark:bg-amber-900/30', 
      text: 'text-amber-700 dark:text-amber-400', 
      border: 'border-amber-200 dark:border-amber-800' 
    },
    moderate: { 
      label: 'Moderate', 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-700 dark:text-orange-400', 
      border: 'border-orange-200 dark:border-orange-800' 
    },
    severe: { 
      label: 'Severe', 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-400', 
      border: 'border-red-200 dark:border-red-800' 
    }
  };
  
  const { label, bg, text, border } = config[level];
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text} ${border} border`}>
      {label}
    </span>
  );
};

// Severity Dot Component
const SeverityDot = ({ level }: { level: SeverityLevel }) => {
  if (!level) return null;
  
  const colors = {
    normal: 'bg-emerald-500',
    mild: 'bg-amber-500',
    moderate: 'bg-orange-500',
    severe: 'bg-red-500'
  };
  
  return <span className={`w-2 h-2 rounded-full ${colors[level]} inline-block ml-2`} />;
};

export const ProcessedResults = ({ data, onNewReport }: ProcessedResultsProps) => {
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Calculate overall AHI severity
  const overallAhi = data.respiratoryEvents?.ahiOverall;
  const overallSeverity = getSeverityLevel(overallAhi, 'ahi');

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
      ['CPAP/BPAP Pressure', data.titrationData?.pressureType === 'CPAP' && data.titrationData?.effectivePressure 
        ? `CPAP ${data.titrationData.effectivePressure} cmH2O`
        : data.titrationData?.pressureType === 'BPAP' && data.titrationData?.effectivePressure
        ? `BPAP ${data.titrationData.effectivePressure} cmH2O`
        : data.titrationData?.pressureType || '---'],
      ['O2 Support', data.titrationData?.oxygenSupport ? 'Yes' : 'No']
    ];
    
    const sleepQualityFields = [
      ['Sleep Latency (min)', data.studyInfo?.sleepLatency],
      ['REM Latency (min)', data.studyInfo?.remLatency],
      ['Sleep Efficiency (%)', data.sleepArchitecture?.sleepEfficiency]
    ];
    
    const sleepStagesFields = [
      ['Sleep Stage 1 (%)', data.sleepArchitecture?.stage1Percent],
      ['Sleep Stage 2 (%)', data.sleepArchitecture?.stage2Percent],
      ['Slow Wave Sleep (%)', data.sleepArchitecture?.slowWaveSleepPercent || data.sleepArchitecture?.stage3Percent],
      ['REM Sleep (%)', data.sleepArchitecture?.remPercent]
    ];
    
    const respiratoryFields = [
      ['AHI (NREM/REM)', `${data.respiratoryEvents?.ahiNrem || '---'} / ${data.respiratoryEvents?.ahiRem || '---'}`],
      ['AHI (Supine/Lateral)', `${data.respiratoryEvents?.ahiSupine || data.additionalMetrics?.supinePositionIndex || '---'} / ${data.respiratoryEvents?.ahiLateral || data.additionalMetrics?.ahiLateral || '---'}`],
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
      
      yPos += summaryHeight + 5;
    }
    
    // Severity Assessment Section
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 40;
    }
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('OSA SEVERITY ASSESSMENT', margin, yPos);
    
    yPos += 10;
    const severityColor = overallSeverity === 'severe' ? [220, 38, 38] as const :
                         overallSeverity === 'moderate' ? [234, 88, 12] as const :
                         overallSeverity === 'mild' ? [245, 158, 11] as const :
                         [34, 197, 94] as const;
    
    doc.setFillColor(severityColor[0], severityColor[1], severityColor[2], 0.1);
    doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
    doc.text(`Overall AHI: ${overallAhi || 'N/A'} - ${overallSeverity?.toUpperCase() || 'N/A'}`, margin + 5, yPos + 8);
    doc.text(`AHI Supine: ${data.respiratoryEvents?.ahiSupine || 'N/A'}`, margin + 5, yPos + 15);
    doc.text(`AHI Lateral: ${data.respiratoryEvents?.ahiLateral || 'N/A'}`, pageWidth/2, yPos + 15);
    
    yPos += 25;
    
    // AI Recommendations Section
    if (data.recommendations && data.recommendations.length > 0) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 40;
      }
      
      yPos += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('AI RECOMMENDATIONS', margin, yPos);
      
      // Add guidelines note
      yPos += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text('Based on AASM Clinical Practice Guidelines and Evidence-Based Resources', margin, yPos);
      
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      data.recommendations.forEach((rec: string, index: number) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 40;
        }
        
        const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, contentWidth - 10);
        doc.text(recLines, margin + 5, yPos);
        yPos += recLines.length * 6;
      });
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
      <div className="bg-background rounded-2xl border">
        <div className="text-center p-8 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-jakarta text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-success protocol-icon" />
                Sleep Study Analysis Complete
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                Report generated for {data.patientInfo?.name || 'Patient'} • {data.studyInfo?.studyDate || 'N/A'}
              </p>
            </div>
            <Badge className="bg-success/20 text-success border-success/30">
              <Activity className="h-3 w-3 mr-1" />
              {data.studyInfo?.studyType || data.studyType || 'Diagnostic'}
            </Badge>
          </div>
        </div>
        <div className="p-8">
          <div className="flex space-x-3">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF Report
            </Button>
            <Button
              onClick={handlePreviewReport}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Preview
            </Button>
            <Button
              onClick={onNewReport}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              New Report
            </Button>
          </div>
        </div>
      </div>

      {/* OSA Severity Assessment Card */}
      <div className="bg-background rounded-2xl border p-6">
        <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          OSA Severity Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall AHI */}
          <div className={`rounded-xl p-4 ${
            overallSeverity === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            overallSeverity === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            overallSeverity === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">Overall AHI</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{overallAhi || '---'}</span>
              <SeverityBadge level={overallSeverity} />
            </div>
          </div>
          
          {/* AHI Supine */}
          <div className={`rounded-xl p-4 ${
            getSeverityLevel(data.respiratoryEvents?.ahiSupine, 'ahiSupine') === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            getSeverityLevel(data.respiratoryEvents?.ahiSupine, 'ahiSupine') === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            getSeverityLevel(data.respiratoryEvents?.ahiSupine, 'ahiSupine') === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">AHI Supine</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{data.respiratoryEvents?.ahiSupine || '---'}</span>
              <SeverityBadge level={getSeverityLevel(data.respiratoryEvents?.ahiSupine, 'ahiSupine')} />
            </div>
          </div>
          
          {/* AHI Lateral */}
          <div className={`rounded-xl p-4 ${
            getSeverityLevel(data.respiratoryEvents?.ahiLateral, 'ahiLateral') === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            getSeverityLevel(data.respiratoryEvents?.ahiLateral, 'ahiLateral') === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            getSeverityLevel(data.respiratoryEvents?.ahiLateral, 'ahiLateral') === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">AHI Lateral</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{data.respiratoryEvents?.ahiLateral || '---'}</span>
              <SeverityBadge level={getSeverityLevel(data.respiratoryEvents?.ahiLateral, 'ahiLateral')} />
            </div>
          </div>
          
          {/* Desaturation Index */}
          <div className={`rounded-xl p-4 ${
            getSeverityLevel(data.oxygenation?.desaturationIndex, 'desaturationIndex') === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            getSeverityLevel(data.oxygenation?.desaturationIndex, 'desaturationIndex') === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            getSeverityLevel(data.oxygenation?.desaturationIndex, 'desaturationIndex') === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">Desaturation Index</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{data.oxygenation?.desaturationIndex || '---'}</span>
              <SeverityBadge level={getSeverityLevel(data.oxygenation?.desaturationIndex, 'desaturationIndex')} />
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Sleep Study Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sleep Timing */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-trust protocol-icon" />
            Sleep Timing
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Light Off</span>
              <span className="font-medium text-foreground font-inter">{data.studyInfo?.lightsOff || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Light On</span>
              <span className="font-medium text-foreground font-inter">{data.studyInfo?.lightsOn || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Time in Bed (min)</span>
              <span className="font-medium text-foreground font-inter">{data.studyInfo?.timeInBed || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Total Sleep Time (min)</span>
              <span className="font-medium text-foreground font-inter">{data.studyInfo?.totalSleepTime || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">CPAP/BPAP Pressure</span>
              <span className="font-medium text-foreground font-inter">
                {data.titrationData?.pressureType === 'CPAP' && data.titrationData?.effectivePressure 
                  ? `CPAP ${data.titrationData.effectivePressure} cmH2O`
                  : data.titrationData?.pressureType === 'BPAP' && data.titrationData?.effectivePressure
                  ? `BPAP ${data.titrationData.effectivePressure} cmH2O`
                  : data.titrationData?.pressureType || '---'}
              </span>
            </div>
            {data.titrationData?.pressureType && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground font-inter">O2 Support</span>
                <span className="font-medium text-foreground font-inter">
                  {data.titrationData?.oxygenSupport ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sleep Latency & Efficiency */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-trust protocol-icon" />
            Sleep Quality
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Sleep Latency (min)</span>
              <span className="font-medium text-foreground font-inter">{data.studyInfo?.sleepLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">REM Latency (min)</span>
              <span className="font-medium text-foreground font-inter">{data.studyInfo?.remLatency || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Sleep Efficiency (%)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">{data.sleepArchitecture?.sleepEfficiency || '---'}</span>
                <SeverityBadge level={getSeverityLevel(data.sleepArchitecture?.sleepEfficiency, 'sleepEfficiency')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Arousal Index (/hr)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">{data.additionalMetrics?.arousalIndex || '---'}</span>
                <SeverityBadge level={getSeverityLevel(data.additionalMetrics?.arousalIndex, 'arousalIndex')} />
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Stages */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-trust protocol-icon" />
            Sleep Architecture
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Sleep Stage 1 (%)</span>
              <span className="font-medium text-foreground font-inter">{data.sleepArchitecture?.stage1Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Sleep Stage 2 (%)</span>
              <span className="font-medium text-foreground font-inter">{data.sleepArchitecture?.stage2Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Slow Wave Sleep (%)</span>
              <span className="font-medium text-foreground font-inter">{data.sleepArchitecture?.slowWaveSleepPercent || data.sleepArchitecture?.stage3Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">REM Sleep (%)</span>
              <span className="font-medium text-foreground font-inter">{data.sleepArchitecture?.remPercent || '---'}</span>
            </div>
          </div>
        </div>

        {/* Respiratory Events */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-trust protocol-icon" />
            Respiratory Events
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">AHI (NREM/REM)</span>
              <span className="font-medium text-foreground font-inter">{data.respiratoryEvents?.ahiNrem || '---'} / {data.respiratoryEvents?.ahiRem || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">AHI (Supine/Lateral) (/hr)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">
                  {data.respiratoryEvents?.ahiSupine || data.additionalMetrics?.supinePositionIndex || '---'} / {data.respiratoryEvents?.ahiLateral || data.additionalMetrics?.ahiLateral || '---'}
                </span>
                <SeverityDot level={getSeverityLevel(data.respiratoryEvents?.ahiSupine, 'ahiSupine')} />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Central Apnea Index</span>
              <span className="font-medium text-foreground font-inter">{data.respiratoryEvents?.centralApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Obstructive Apnea Index (/hr)</span>
              <span className="font-medium text-foreground font-inter">{data.respiratoryEvents?.obstructiveApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Mixed Apnea Index</span>
              <span className="font-medium text-foreground font-inter">{data.respiratoryEvents?.mixedApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Hypopnea Index (/hr)</span>
              <span className="font-medium text-foreground font-inter">{data.respiratoryEvents?.hypopneaIndex || '---'}</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-trust protocol-icon" />
            Additional Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Hypopnea Mean Duration (sec)</span>
              <span className="font-medium text-foreground font-inter">{data.respiratoryEvents?.meanHypopneaDuration || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-inter">Heart Rate (NREM/REM)</span>
              <span className="font-medium text-foreground font-inter">
                {data.cardiacData?.meanHeartRateNrem || '---'} / {data.cardiacData?.meanHeartRateRem || '---'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Desaturation Index (/hr)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">{data.oxygenation?.desaturationIndex || '---'}</span>
                <SeverityBadge level={getSeverityLevel(data.oxygenation?.desaturationIndex, 'desaturationIndex')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Snoring (%)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">{data.additionalMetrics?.snoringPercent || '---'}</span>
                <SeverityBadge level={getSeverityLevel(data.additionalMetrics?.snoringPercent, 'snoring')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Leg Movement Index (/hr)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">{data.additionalMetrics?.legMovementIndex || '---'}</span>
                <SeverityBadge level={getSeverityLevel(data.additionalMetrics?.legMovementIndex, 'legMovementIndex')} />
              </div>
            </div>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-trust protocol-icon" />
            Oxygen Saturation
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">% Time with O2 &lt; 90%</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">
                  {data.oxygenation?.timeBelow90Percent !== null && data.oxygenation?.timeBelow90Percent !== undefined 
                    ? data.oxygenation.timeBelow90Percent 
                    : '---'}
                </span>
                <SeverityBadge level={getSeverityLevel(data.oxygenation?.timeBelow90Percent, 'o2Below90')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">% Time with O2 &lt; 95%</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">
                  {data.oxygenation?.timeBelow95Percent !== null && data.oxygenation?.timeBelow95Percent !== undefined 
                    ? data.oxygenation.timeBelow95Percent 
                    : '---'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Lowest O2 / Average O2</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">
                  {data.oxygenation?.lowestSpO2 || '---'} / {data.oxygenation?.averageSpO2 || '---'}
                </span>
                <SeverityBadge level={getSeverityLevel(data.oxygenation?.lowestSpO2, 'lowestO2')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generated Summary */}
      {data.clinicalSummary && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4">Clinical Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-inter">
            {data.clinicalSummary}
          </p>
        </div>
      )}

      {/* AI Recommendations Box */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-success/5 rounded-xl border border-success/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold font-jakarta text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-success" />
              AI Recommendations
            </h3>
            <Badge className="bg-success/20 text-success text-xs border-success/30">
              Evidence-Based
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4 italic font-inter">
            Based on AASM Clinical Practice Guidelines and Evidence-Based Resources
          </p>
          <ul className="space-y-2">
            {data.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start text-sm">
                <span className="mr-2 text-success font-bold">{index + 1}.</span>
                <span className="text-muted-foreground font-inter">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Patient Comments */}
      {data.patientComments && data.patientComments.length > 0 && (
        <div className="bg-secondary/5 rounded-xl border border-secondary/20 p-6">
          <h3 className="text-lg font-semibold font-jakarta text-foreground mb-4">Patient Comments</h3>
          <ul className="text-sm text-muted-foreground leading-relaxed font-inter space-y-2">
            {Array.isArray(data.patientComments) ? (
              data.patientComments.map((comment, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span>{comment}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>{data.patientComments}</span>
              </li>
            )}
          </ul>
        </div>
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