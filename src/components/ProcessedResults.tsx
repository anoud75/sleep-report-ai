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
      <div className="medical-card rounded-2xl border-success/30 bg-black/60 backdrop-blur-xl">
        <div className="text-center p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-jakarta glow-text text-white mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-success protocol-icon" />
                Sleep Study Analysis Complete
              </h2>
              <p className="text-lg text-white/70 font-inter">
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
            <button
              onClick={handleDownloadPDF}
              className="luxury-button haptic-feedback flex-1 font-inter tracking-wide py-3 rounded-xl flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </button>
            <button
              onClick={handlePreviewReport}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors font-inter"
            >
              Preview
            </button>
            <button
              onClick={onNewReport}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors font-inter"
            >
              New Report
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Sleep Study Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sleep Timing */}
        <div className="medical-card rounded-xl border-trust/20 bg-black/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-trust protocol-icon" />
            Sleep Timing
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Light Off</span>
              <span className="font-medium text-white font-inter">{data.studyInfo?.lightsOff || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Light On</span>
              <span className="font-medium text-white font-inter">{data.studyInfo?.lightsOn || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Time in Bed (min)</span>
              <span className="font-medium text-white font-inter">{data.studyInfo?.timeInBed || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Total Sleep Time (min)</span>
              <span className="font-medium text-white font-inter">{data.studyInfo?.totalSleepTime || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">CPAP/BPAP/O2</span>
              <span className="font-medium text-white font-inter">{data.titrationData?.pressureType || '---'}</span>
            </div>
          </div>
        </div>

        {/* Sleep Latency & Efficiency */}
        <div className="medical-card rounded-xl border-trust/20 bg-black/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-trust protocol-icon" />
            Sleep Quality
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Sleep Latency (min)</span>
              <span className="font-medium text-white font-inter">{data.studyInfo?.sleepLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">REM Latency (min)</span>
              <span className="font-medium text-white font-inter">{data.studyInfo?.remLatency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Sleep Efficiency (%)</span>
              <span className="font-medium text-white font-inter">{data.sleepArchitecture?.sleepEfficiency || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Arousal Index (/hr)</span>
              <span className="font-medium text-white font-inter">{data.additionalMetrics?.arousalIndex || '---'}</span>
            </div>
          </div>
        </div>

        {/* Sleep Stages */}
        <div className="medical-card rounded-xl border-trust/20 bg-black/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-trust protocol-icon" />
            Sleep Architecture
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Sleep Stage 1 (%)</span>
              <span className="font-medium text-white font-inter">{data.sleepArchitecture?.stage1Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Sleep Stage 2 (%)</span>
              <span className="font-medium text-white font-inter">{data.sleepArchitecture?.stage2Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Slow Wave Sleep (%)</span>
              <span className="font-medium text-white font-inter">{data.sleepArchitecture?.stage3Percent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">REM Sleep (%)</span>
              <span className="font-medium text-white font-inter">{data.sleepArchitecture?.remPercent || '---'}</span>
            </div>
          </div>
        </div>

        {/* Respiratory Events */}
        <div className="medical-card rounded-xl border-trust/20 bg-black/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-trust protocol-icon" />
            Respiratory Events
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">AHI (NREM/REM)</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.ahiNrem || '---'} / {data.respiratoryEvents?.ahiRem || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">AHI (supine/lateral)</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.ahiSupine || '---'} / {data.respiratoryEvents?.ahiLateral || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Central Apnea Index</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.centralApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Obstructive Apnea Index (/hr)</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.obstructiveApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Mixed Apnea Index</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.mixedApneaIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Hypopnea Index (/hr)</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.hypopneaIndex || '---'}</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="medical-card rounded-xl border-trust/20 bg-black/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-trust protocol-icon" />
            Additional Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Hypopnea Mean Duration (sec)</span>
              <span className="font-medium text-white font-inter">{data.respiratoryEvents?.meanHypopneaDuration || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Heart Rate (NREM/REM)</span>
              <span className="font-medium text-white font-inter">
                {data.cardiacData?.meanHeartRateNrem || '---'} / {data.cardiacData?.meanHeartRateRem || '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Desaturation Index (/hr)</span>
              <span className="font-medium text-white font-inter">{data.oxygenation?.desaturationIndex || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Snoring (%)</span>
              <span className="font-medium text-white font-inter">{data.additionalMetrics?.snoringPercent || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Leg Movement Index (/hr)</span>
              <span className="font-medium text-white font-inter">{data.additionalMetrics?.legMovementIndex || '---'}</span>
            </div>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="medical-card rounded-xl border-trust/20 bg-black/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-trust protocol-icon" />
            Oxygen Saturation
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">% Time with O2 &lt; 90%</span>
              <span className="font-medium text-white font-inter">{data.oxygenation?.timeBelow90Percent ?? '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">% Time with O2 &lt; 95%</span>
              <span className="font-medium text-white font-inter">{data.oxygenation?.timeBelow95Percent ?? '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70 font-inter">Lowest O2 / Average O2</span>
              <span className="font-medium text-white font-inter">
                {data.oxygenation?.lowestSpO2 || '---'} / {data.oxygenation?.averageSpO2 || '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generated Summary */}
      {data.clinicalSummary && (
        <div className="medical-card rounded-xl border-primary/20 bg-primary/5 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold font-jakarta text-white mb-4">Clinical Summary</h3>
          <p className="text-sm text-white/70 leading-relaxed font-inter">
            {data.clinicalSummary}
          </p>
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