import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, User, Calendar, Activity, Stethoscope, TrendingUp, Brain, AlertTriangle, Pencil, Check, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// Editable Field Component
interface EditableFieldProps {
  value: string | number;
  field: string;
  isEditMode: boolean;
  onChange: (field: string, value: string) => void;
  type?: 'text' | 'number';
  className?: string;
}

const EditableField = ({ value, field, isEditMode, onChange, type = 'text', className = '' }: EditableFieldProps) => {
  if (!isEditMode) {
    return <span className={className}>{value || '---'}</span>;
  }
  
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-20 h-7 text-right ${className}`}
    />
  );
};

export const ProcessedResults = ({ data, onNewReport }: ProcessedResultsProps) => {
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Editable data state - initialized from data
  const [editableData, setEditableData] = useState({
    // Patient Information (manually entered for privacy)
    patientName: '',
    patientMRN: '',
    patientAge: '',
    patientBMI: '',
    studyDate: data.patientInfo?.studyDate || new Date().toLocaleDateString(),
    hijraDate: '',
    ward: 'SDC',
    studyNumber: '',
    referringPhysician: '',
    clinicalDiagnosis: 'OSA',
    psgDiagnosis: '',
    doneBy: '',
    scoredBy: '',
    // Respiratory Events
    ahiOverall: data.respiratoryEvents?.ahiOverall || '',
    ahiSupine: data.respiratoryEvents?.ahiSupine || '',
    ahiLateral: data.respiratoryEvents?.ahiLateral || '',
    ahiNrem: data.respiratoryEvents?.ahiNrem || '',
    ahiRem: data.respiratoryEvents?.ahiRem || '',
    centralApneaIndex: data.respiratoryEvents?.centralApneaIndex || '',
    obstructiveApneaIndex: data.respiratoryEvents?.obstructiveApneaIndex || '',
    mixedApneaIndex: data.respiratoryEvents?.mixedApneaIndex || '',
    hypopneaIndex: data.respiratoryEvents?.hypopneaIndex || '',
    meanHypopneaDuration: data.respiratoryEvents?.meanHypopneaDuration || '',
    // Sleep Architecture
    sleepEfficiency: data.sleepArchitecture?.sleepEfficiency || '',
    stage1Percent: data.sleepArchitecture?.stage1Percent || '',
    stage2Percent: data.sleepArchitecture?.stage2Percent || '',
    slowWaveSleepPercent: data.sleepArchitecture?.slowWaveSleepPercent || data.sleepArchitecture?.stage3Percent || '',
    remPercent: data.sleepArchitecture?.remPercent || '',
    // Additional Metrics
    snoringPercent: data.additionalMetrics?.snoringPercent || '',
    legMovementIndex: data.additionalMetrics?.legMovementIndex || '',
    arousalIndex: data.additionalMetrics?.arousalIndex || '',
    // Oxygenation
    desaturationIndex: data.oxygenation?.desaturationIndex || '',
    timeBelow90: data.oxygenation?.timeBelow90Percent ?? '',
    timeBelow95: data.oxygenation?.timeBelow95Percent ?? '',
    lowestSpO2: data.oxygenation?.lowestSpO2 || '',
    averageSpO2: data.oxygenation?.averageSpO2 || '',
    // Cardiac
    meanHeartRateNrem: data.cardiacData?.meanHeartRateNrem || '',
    meanHeartRateRem: data.cardiacData?.meanHeartRateRem || '',
    // Sleep Info
    sleepLatency: data.studyInfo?.sleepLatency || '',
    remLatency: data.studyInfo?.remLatency || '',
    // Clinical Summary & Recommendations
    clinicalSummary: data.clinicalSummary || '',
    recommendations: data.recommendations || [],
  });

  // Handle field change
  const handleFieldChange = (field: string, value: string) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  // Handle recommendation change
  const handleRecommendationChange = (index: number, value: string) => {
    const newRecs = [...editableData.recommendations];
    newRecs[index] = value;
    setEditableData(prev => ({ ...prev, recommendations: newRecs }));
  };

  // Add new recommendation
  const handleAddRecommendation = () => {
    setEditableData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  };

  // Remove recommendation
  const handleRemoveRecommendation = (index: number) => {
    setEditableData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };
  
  // Calculate overall AHI severity using editable data
  const overallAhi = editableData.ahiOverall;
  const overallSeverity = getSeverityLevel(overallAhi, 'ahi');

  const handleDownloadPDF = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Professional color scheme
    const headerBg = [0, 51, 102] as const; // Dark blue
    const tableBorder = [200, 200, 200] as const; // Light gray
    const tableHeaderBg = [240, 245, 250] as const; // Very light blue
    const textDark = [51, 51, 51] as const;
    
    // Helper: Generate Study ID
    const generateStudyId = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `PSG-${year}${month}${day}-${random}`;
    };
    
    // Helper: Get PSG Diagnosis from severity
    const getPSGDiagnosis = () => {
      const ahi = parseFloat(editableData.ahiOverall as string) || 0;
      if (ahi < 5) return 'Normal';
      if (ahi < 15) return 'Mild OSA';
      if (ahi < 30) return 'Moderate OSA';
      return 'Severe OSA';
    };
    
    // Helper: Draw professional header
    const drawHeader = () => {
      doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo placeholder circle
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 17, 10, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Sleep Study Report Center', 45, 15);
      
      // Contact info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Phone: ________  Fax: ________  Email: ________', 45, 25);
    };
    
    // Helper: Draw footer
    const drawFooter = (pageNum: number, totalPages: number) => {
      doc.setDrawColor(tableBorder[0], tableBorder[1], tableBorder[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`Done By: ${editableData.doneBy || '___________'}`, margin, pageHeight - 8);
      doc.text(`Scored By: ${editableData.scoredBy || '___________'}`, pageWidth/2 - 20, pageHeight - 8);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
    };
    
    // Helper: Draw two-column table
    const drawTwoColumnTable = (data: [string, string][], startY: number, withBorders = true) => {
      const colWidth = contentWidth / 2;
      let yPos = startY;
      
      data.forEach(([label, value]) => {
        // Draw row borders
        if (withBorders) {
          doc.setDrawColor(tableBorder[0], tableBorder[1], tableBorder[2]);
          doc.setLineWidth(0.3);
          doc.rect(margin, yPos, colWidth, 7);
          doc.rect(margin + colWidth, yPos, colWidth, 7);
        }
        
        // Label (left column)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(label, margin + 2, yPos + 5);
        
        // Value (right column)
        doc.setFont('helvetica', 'normal');
        doc.text(value || '---', margin + colWidth + 2, yPos + 5);
        
        yPos += 7;
      });
      
      return yPos;
    };
    
    // === PAGE 1: Patient Info & Events ===
    drawHeader();
    
    // Title Section
    let yPos = 42;
    doc.setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2]);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Interpretation of Overnight Sleep Study', pageWidth / 2, yPos + 7, { align: 'center' });
    
    // Patient Information Table
    yPos = 58;
    const patientData: [string, string][] = [
      ['ID', generateStudyId()],
      ['Patient Name', editableData.patientName || '---'],
      ['MRN', editableData.patientMRN || '---'],
      ['BMI', editableData.patientBMI || '---'],
      ['Gregorian Date', editableData.studyDate || '---'],
      ['Hijra Date', editableData.hijraDate || '---'],
      ['Age (Years)', editableData.patientAge || '---'],
      ['Ward', editableData.ward || 'SDC'],
      ['Study Number', editableData.studyNumber || '---'],
      ['Referring Physician', editableData.referringPhysician || '---'],
      ['Clinical Diagnosis', editableData.clinicalDiagnosis || 'OSA'],
      ['PSG Diagnosis', editableData.psgDiagnosis || getPSGDiagnosis()],
    ];
    
    yPos = drawTwoColumnTable(patientData, yPos);
    
    // Note
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('Note: Overnight sleep study was done.', margin, yPos);
    
    // Events Table Header
    yPos += 10;
    doc.setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2]);
    doc.rect(margin, yPos, contentWidth / 2, 8, 'F');
    doc.rect(margin + contentWidth / 2, yPos, contentWidth / 2, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
    doc.text('Events', margin + 2, yPos + 5.5);
    doc.text('Reports', margin + contentWidth / 2 + 2, yPos + 5.5);
    
    // Events Data
    yPos += 8;
    const eventsData: [string, string][] = [
      ['Light off', data.studyInfo?.lightsOff || '---'],
      ['Light on', data.studyInfo?.lightsOn || '---'],
      ['Time in Bed (min)', data.studyInfo?.timeInBed?.toString() || '---'],
      ['Total Sleep Time (min)', data.studyInfo?.totalSleepTime?.toString() || '---'],
      ['Sleep Latency (min)', editableData.sleepLatency?.toString() || '---'],
      ['REM Latency (min)', editableData.remLatency?.toString() || '---'],
      ['Sleep Efficiency (%)', editableData.sleepEfficiency?.toString() || '---'],
      ['Sleep Stage 1 (%)', editableData.stage1Percent?.toString() || '---'],
      ['Sleep Stage 2 (%)', editableData.stage2Percent?.toString() || '---'],
      ['Slow Wave Sleep (%)', editableData.slowWaveSleepPercent?.toString() || '---'],
      ['REM Sleep (%)', editableData.remPercent?.toString() || '---'],
      ['AHI Overall (/hr)', editableData.ahiOverall?.toString() || '---'],
      ['AHI NREM (/hr)', editableData.ahiNrem?.toString() || '---'],
      ['AHI REM (/hr)', editableData.ahiRem?.toString() || '---'],
      ['AHI Supine (/hr)', editableData.ahiSupine?.toString() || '---'],
      ['AHI Lateral (/hr)', editableData.ahiLateral?.toString() || '---'],
      ['Central Apnea Index (/hr)', editableData.centralApneaIndex?.toString() || '---'],
      ['Obstructive Apnea Index (/hr)', editableData.obstructiveApneaIndex?.toString() || '---'],
      ['Mixed Apnea Index (/hr)', editableData.mixedApneaIndex?.toString() || '---'],
      ['Hypopnea Index (/hr)', editableData.hypopneaIndex?.toString() || '---'],
      ['Hypopnea Mean Duration (sec)', editableData.meanHypopneaDuration?.toString() || '---'],
      ['Desaturation Index (/hr)', editableData.desaturationIndex?.toString() || '---'],
      ['% Time with O2 < 90%', editableData.timeBelow90?.toString() || '---'],
      ['% Time with O2 < 95%', editableData.timeBelow95?.toString() || '---'],
      ['Lowest O2 (%)', editableData.lowestSpO2?.toString() || '---'],
      ['Average O2 (%)', editableData.averageSpO2?.toString() || '---'],
      ['Heart Rate NREM (bpm)', editableData.meanHeartRateNrem?.toString() || '---'],
      ['Heart Rate REM (bpm)', editableData.meanHeartRateRem?.toString() || '---'],
      ['Arousal Index (/hr)', editableData.arousalIndex?.toString() || '---'],
      ['Snoring (%)', editableData.snoringPercent?.toString() || '---'],
      ['Leg Movement Index (/hr)', editableData.legMovementIndex?.toString() || '---'],
    ];
    
    yPos = drawTwoColumnTable(eventsData, yPos);
    
    // Footer for page 1
    drawFooter(1, 2);
    
    // === PAGE 2: Summary & Recommendations ===
    doc.addPage();
    drawHeader();
    
    yPos = 45;
    
    // Clinical Summary Section
    if (editableData.clinicalSummary) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
      doc.text('Summary:', margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const summaryLines = doc.splitTextToSize(editableData.clinicalSummary, contentWidth - 4);
      doc.text(summaryLines, margin + 2, yPos);
      yPos += summaryLines.length * 5 + 10;
    }
    
    // Patient Comments Section
    if (data.patientComments) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
      doc.text("Patient's Comments:", margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const commentsLines = doc.splitTextToSize(data.patientComments, contentWidth - 4);
      doc.text(commentsLines, margin + 2, yPos);
      yPos += commentsLines.length * 5 + 10;
    }
    
    // Recommendations Section (NO AI BRANDING)
    if (editableData.recommendations && editableData.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
      doc.text('Recommendations:', margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      
      editableData.recommendations.forEach((rec: string, index: number) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          drawHeader();
          yPos = 45;
        }
        
        const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, contentWidth - 4);
        doc.text(recLines, margin + 2, yPos);
        yPos += recLines.length * 5 + 3;
      });
    }
    
    // Footer for page 2
    drawFooter(2, 2);
    
    doc.save(`sleep-study-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your professional sleep study report has been downloaded.",
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
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? "default" : "outline"}
              size="lg"
              className="flex items-center gap-2"
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Edit Results
                </>
              )}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              disabled={isEditMode}
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

      {/* Patient Information Section - Editable for PDF */}
      <div className="bg-background rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-jakarta text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Information
          </h3>
          <Badge variant="outline" className="text-xs">
            For PDF Report
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Patient Name</Label>
            <Input 
              value={editableData.patientName} 
              onChange={(e) => handleFieldChange('patientName', e.target.value)} 
              placeholder="Enter patient name..."
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">MRN</Label>
            <Input 
              value={editableData.patientMRN} 
              onChange={(e) => handleFieldChange('patientMRN', e.target.value)} 
              placeholder="00-00-00-00"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Age (Years)</Label>
            <Input 
              type="number" 
              value={editableData.patientAge} 
              onChange={(e) => handleFieldChange('patientAge', e.target.value)} 
              placeholder="Age"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">BMI</Label>
            <Input 
              type="number" 
              value={editableData.patientBMI} 
              onChange={(e) => handleFieldChange('patientBMI', e.target.value)} 
              placeholder="BMI"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Study Date</Label>
            <Input 
              value={editableData.studyDate} 
              onChange={(e) => handleFieldChange('studyDate', e.target.value)} 
              placeholder="Study date"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hijra Date</Label>
            <Input 
              value={editableData.hijraDate} 
              onChange={(e) => handleFieldChange('hijraDate', e.target.value)} 
              placeholder="Hijra date"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ward</Label>
            <Input 
              value={editableData.ward} 
              onChange={(e) => handleFieldChange('ward', e.target.value)} 
              placeholder="Ward"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Study Number</Label>
            <Input 
              value={editableData.studyNumber} 
              onChange={(e) => handleFieldChange('studyNumber', e.target.value)} 
              placeholder="Study number"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Referring Physician</Label>
            <Input 
              value={editableData.referringPhysician} 
              onChange={(e) => handleFieldChange('referringPhysician', e.target.value)} 
              placeholder="Physician name"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Clinical Diagnosis</Label>
            <Input 
              value={editableData.clinicalDiagnosis} 
              onChange={(e) => handleFieldChange('clinicalDiagnosis', e.target.value)} 
              placeholder="Clinical diagnosis"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">PSG Diagnosis</Label>
            <Input 
              value={editableData.psgDiagnosis} 
              onChange={(e) => handleFieldChange('psgDiagnosis', e.target.value)} 
              placeholder="Auto-generated from AHI"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Done By</Label>
            <Input 
              value={editableData.doneBy} 
              onChange={(e) => handleFieldChange('doneBy', e.target.value)} 
              placeholder="Technician name"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Scored By</Label>
            <Input 
              value={editableData.scoredBy} 
              onChange={(e) => handleFieldChange('scoredBy', e.target.value)} 
              placeholder="Scorer name"
              className="h-9"
            />
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
              <EditableField
                value={editableData.ahiOverall}
                field="ahiOverall"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="text-2xl font-bold text-foreground"
              />
              <SeverityBadge level={overallSeverity} />
            </div>
          </div>
          
          {/* AHI Supine */}
          <div className={`rounded-xl p-4 ${
            getSeverityLevel(editableData.ahiSupine, 'ahiSupine') === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            getSeverityLevel(editableData.ahiSupine, 'ahiSupine') === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            getSeverityLevel(editableData.ahiSupine, 'ahiSupine') === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">AHI Supine</p>
            <div className="flex items-center gap-2 mt-1">
              <EditableField
                value={editableData.ahiSupine}
                field="ahiSupine"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="text-2xl font-bold text-foreground"
              />
              <SeverityBadge level={getSeverityLevel(editableData.ahiSupine, 'ahiSupine')} />
            </div>
          </div>
          
          {/* AHI Lateral */}
          <div className={`rounded-xl p-4 ${
            getSeverityLevel(editableData.ahiLateral, 'ahiLateral') === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            getSeverityLevel(editableData.ahiLateral, 'ahiLateral') === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            getSeverityLevel(editableData.ahiLateral, 'ahiLateral') === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">AHI Lateral</p>
            <div className="flex items-center gap-2 mt-1">
              <EditableField
                value={editableData.ahiLateral}
                field="ahiLateral"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="text-2xl font-bold text-foreground"
              />
              <SeverityBadge level={getSeverityLevel(editableData.ahiLateral, 'ahiLateral')} />
            </div>
          </div>
          
          {/* Desaturation Index */}
          <div className={`rounded-xl p-4 ${
            getSeverityLevel(editableData.desaturationIndex, 'desaturationIndex') === 'severe' ? 'bg-red-50 dark:bg-red-950/20' :
            getSeverityLevel(editableData.desaturationIndex, 'desaturationIndex') === 'moderate' ? 'bg-orange-50 dark:bg-orange-950/20' :
            getSeverityLevel(editableData.desaturationIndex, 'desaturationIndex') === 'mild' ? 'bg-amber-50 dark:bg-amber-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20'
          }`}>
            <p className="text-sm text-muted-foreground font-inter">Desaturation Index</p>
            <div className="flex items-center gap-2 mt-1">
              <EditableField
                value={editableData.desaturationIndex}
                field="desaturationIndex"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="text-2xl font-bold text-foreground"
              />
              <SeverityBadge level={getSeverityLevel(editableData.desaturationIndex, 'desaturationIndex')} />
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Sleep Latency (min)</span>
              <EditableField
                value={editableData.sleepLatency || data.studyInfo?.sleepLatency || ''}
                field="sleepLatency"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">REM Latency (min)</span>
              <EditableField
                value={editableData.remLatency || data.studyInfo?.remLatency || ''}
                field="remLatency"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Sleep Efficiency (%)</span>
              <div className="flex items-center gap-2">
                <EditableField
                  value={editableData.sleepEfficiency}
                  field="sleepEfficiency"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter"
                />
                <SeverityBadge level={getSeverityLevel(editableData.sleepEfficiency, 'sleepEfficiency')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Arousal Index (/hr)</span>
              <div className="flex items-center gap-2">
                <EditableField
                  value={editableData.arousalIndex}
                  field="arousalIndex"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter"
                />
                <SeverityBadge level={getSeverityLevel(editableData.arousalIndex, 'arousalIndex')} />
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Sleep Stage 1 (%)</span>
              <EditableField
                value={editableData.stage1Percent}
                field="stage1Percent"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Sleep Stage 2 (%)</span>
              <EditableField
                value={editableData.stage2Percent}
                field="stage2Percent"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Slow Wave Sleep (%)</span>
              <EditableField
                value={editableData.slowWaveSleepPercent}
                field="slowWaveSleepPercent"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">REM Sleep (%)</span>
              <EditableField
                value={editableData.remPercent}
                field="remPercent"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">AHI (NREM/REM)</span>
              <span className="font-medium text-foreground font-inter">
                <EditableField
                  value={editableData.ahiNrem}
                  field="ahiNrem"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter inline-block w-16"
                /> / <EditableField
                  value={editableData.ahiRem}
                  field="ahiRem"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter inline-block w-16"
                />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">AHI (Supine/Lateral) (/hr)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground font-inter">
                  <EditableField
                    value={editableData.ahiSupine}
                    field="ahiSupine"
                    isEditMode={isEditMode}
                    onChange={handleFieldChange}
                    type="number"
                    className="font-medium text-foreground font-inter inline-block w-16"
                  /> / <EditableField
                    value={editableData.ahiLateral}
                    field="ahiLateral"
                    isEditMode={isEditMode}
                    onChange={handleFieldChange}
                    type="number"
                    className="font-medium text-foreground font-inter inline-block w-16"
                  />
                </span>
                <SeverityDot level={getSeverityLevel(editableData.ahiSupine, 'ahiSupine')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Central Apnea Index</span>
              <EditableField
                value={editableData.centralApneaIndex}
                field="centralApneaIndex"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Obstructive Apnea Index (/hr)</span>
              <EditableField
                value={editableData.obstructiveApneaIndex}
                field="obstructiveApneaIndex"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Mixed Apnea Index</span>
              <EditableField
                value={editableData.mixedApneaIndex}
                field="mixedApneaIndex"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Hypopnea Index (/hr)</span>
              <EditableField
                value={editableData.hypopneaIndex}
                field="hypopneaIndex"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Hypopnea Mean Duration (sec)</span>
              <EditableField
                value={editableData.meanHypopneaDuration}
                field="meanHypopneaDuration"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Heart Rate (NREM/REM)</span>
              <span className="font-medium text-foreground font-inter">
                <EditableField
                  value={editableData.meanHeartRateNrem}
                  field="meanHeartRateNrem"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter inline-block w-16"
                /> / <EditableField
                  value={editableData.meanHeartRateRem}
                  field="meanHeartRateRem"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter inline-block w-16"
                />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Desaturation Index (/hr)</span>
              <div className="flex items-center gap-2">
                <EditableField
                  value={editableData.desaturationIndex}
                  field="desaturationIndex"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter"
                />
                <SeverityBadge level={getSeverityLevel(editableData.desaturationIndex, 'desaturationIndex')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Snoring (%)</span>
              <div className="flex items-center gap-2">
                <EditableField
                  value={editableData.snoringPercent}
                  field="snoringPercent"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter"
                />
                <SeverityBadge level={getSeverityLevel(editableData.snoringPercent, 'snoring')} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Leg Movement Index (/hr)</span>
              <div className="flex items-center gap-2">
                <EditableField
                  value={editableData.legMovementIndex}
                  field="legMovementIndex"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter"
                />
                <SeverityBadge level={getSeverityLevel(editableData.legMovementIndex, 'legMovementIndex')} />
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
              <EditableField
                value={editableData.timeBelow90}
                field="timeBelow90"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">% Time with O2 &lt; 95%</span>
              <EditableField
                value={editableData.timeBelow95}
                field="timeBelow95"
                isEditMode={isEditMode}
                onChange={handleFieldChange}
                type="number"
                className="font-medium text-foreground font-inter"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-inter">Lowest O2 / Average O2</span>
              <span className="font-medium text-foreground font-inter">
                <EditableField
                  value={editableData.lowestSpO2}
                  field="lowestSpO2"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter inline-block w-16"
                /> / <EditableField
                  value={editableData.averageSpO2}
                  field="averageSpO2"
                  isEditMode={isEditMode}
                  onChange={handleFieldChange}
                  type="number"
                  className="font-medium text-foreground font-inter inline-block w-16"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Summary - Editable */}
      {editableData.clinicalSummary && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-jakarta text-foreground">Clinical Summary</h3>
            {isEditMode && (
              <Badge variant="outline" className="text-xs">Editing</Badge>
            )}
          </div>
          {isEditMode ? (
            <Textarea
              value={editableData.clinicalSummary}
              onChange={(e) => handleFieldChange('clinicalSummary', e.target.value)}
              className="min-h-[100px] text-sm font-inter"
              placeholder="Enter clinical summary..."
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed font-inter">
              {editableData.clinicalSummary}
            </p>
          )}
        </div>
      )}

      {/* Recommendations - Editable (AI label ONLY on website) */}
      {editableData.recommendations && editableData.recommendations.length > 0 && (
        <div className="bg-success/5 rounded-xl border border-success/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold font-jakarta text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-success" />
              AI Recommendations
            </h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-success/20 text-success text-xs border-success/30">
                Evidence-Based
              </Badge>
              {isEditMode && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAddRecommendation}
                  className="h-7"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4 italic font-inter">
            Based on AASM Clinical Practice Guidelines and Evidence-Based Resources
          </p>
          <ul className="space-y-2">
            {editableData.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start text-sm">
                <span className="mr-2 text-success font-bold">{index + 1}.</span>
                {isEditMode ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={rec}
                      onChange={(e) => handleRecommendationChange(index, e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRecommendation(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground font-inter">{rec}</span>
                )}
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