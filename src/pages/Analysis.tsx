import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Shield, Zap, Heart } from "lucide-react";
import { StudyTypeSelector } from "@/components/StudyTypeSelector";
import { EnhancedFileUpload } from "@/components/EnhancedFileUpload";
import { ProcessedResults } from "@/components/ProcessedResults";
import { Header } from "@/components/Header";

const Analysis = () => {
  const [selectedStudyType, setSelectedStudyType] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [reportCount, setReportCount] = useState(0);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  // Set document title on component mount
  useEffect(() => {
    document.title = "Analysis - Sleep Report AI";
  }, []);

  const handleFileProcessed = (data: any) => {
    console.log("=== FILE PROCESSED - Raw Data Received ===");
    console.log(JSON.stringify(data, null, 2));
    
    if (!data) {
      console.error("❌ No data received from edge function");
      return;
    }

    // For Split-Night studies, pass through the special structure
    if (data.isSplitNight) {
      const normalized = {
        ...data,
        studyType: data.studyType || 'Split-Night'
      };
      
      console.log("=== SPLIT-NIGHT DATA FOR UI ===");
      console.log(JSON.stringify(normalized, null, 2));
      
      setProcessedData(normalized);
      setReportCount(prev => prev + 1);
      return;
    }

    // Comprehensive normalization for regular studies - support both old and new formats
    const normalized = {
      patientInfo: data.patientInfo || {
        name: data.extractedData?.patientName || 'Patient Name',
        firstName: data.extractedData?.firstName || null,
        age: data.patientInfo?.age || null,
        gender: data.patientInfo?.gender || null,
        studyDate: data.studyInfo?.studyDate || data.extractedData?.studyDate || null,
        studyType: data.studyInfo?.studyType || data.extractedData?.studyType || selectedStudyType
      },
      studyInfo: data.studyInfo || {
        studyType: data.studyInfo?.studyType || data.extractedData?.studyType || selectedStudyType,
        lightsOff: data.studyInfo?.lightsOff || null,
        lightsOn: data.studyInfo?.lightsOn || null,
        timeInBed: data.studyInfo?.timeInBed || null,
        totalSleepTime: data.studyInfo?.totalSleepTime || data.extractedData?.totalSleepTime || null,
        sleepLatency: data.studyInfo?.sleepLatency || data.extractedData?.sleepLatency || null,
        remLatency: data.studyInfo?.remLatency || data.extractedData?.remLatency || null
      },
      sleepArchitecture: data.sleepArchitecture || {
        sleepEfficiency: data.sleepArchitecture?.sleepEfficiency || data.extractedData?.sleepEfficiency || null,
        stage1Percent: data.sleepArchitecture?.stage1Percent || null,
        stage2Percent: data.sleepArchitecture?.stage2Percent || null,
        stage3Percent: data.sleepArchitecture?.stage3Percent || null,
        remPercent: data.sleepArchitecture?.remPercent || null,
        remCycles: data.sleepArchitecture?.remCycles || null
      },
      respiratoryEvents: data.respiratoryEvents || {
        ahiOverall: data.respiratoryEvents?.ahiOverall || null,
        ahiNrem: data.respiratoryEvents?.ahiNrem || null,
        ahiRem: data.respiratoryEvents?.ahiRem || null,
        ahiSupine: data.respiratoryEvents?.ahiSupine || null,
        ahiLateral: data.respiratoryEvents?.ahiLateral || null,
        centralApneaIndex: data.respiratoryEvents?.centralApneaIndex || null,
        obstructiveApneaIndex: data.respiratoryEvents?.obstructiveApneaIndex || null,
        mixedApneaIndex: data.respiratoryEvents?.mixedApneaIndex || null,
        hypopneaIndex: data.respiratoryEvents?.hypopneaIndex || null,
        meanHypopneaDuration: data.respiratoryEvents?.meanHypopneaDuration || data.extractedData?.hypopneaMeanDuration || null
      },
      oxygenation: data.oxygenation || {
        averageSpO2: data.oxygenation?.averageSpO2 || data.extractedData?.averageO2 || null,
        desaturationIndex: data.oxygenation?.desaturationIndex || data.extractedData?.desaturationIndex || null,
        timeBelow90Percent: data.oxygenation?.timeBelow90Percent || data.extractedData?.oxygenUnder90Percent || null,
        timeBelow95Percent: data.oxygenation?.timeBelow95Percent || data.extractedData?.oxygenUnder95Percent || null,
        lowestSpO2: data.oxygenation?.lowestSpO2 || data.extractedData?.lowestO2 || null
      },
      cardiacData: data.cardiacData || {
        meanHeartRateNrem: data.cardiacData?.meanHeartRateNrem || null,
        meanHeartRateRem: data.cardiacData?.meanHeartRateRem || null
      },
      additionalMetrics: data.additionalMetrics || {
        arousalIndex: data.additionalMetrics?.arousalIndex || data.extractedData?.arousalIndex || null,
        snoringMinutes: data.additionalMetrics?.snoringMinutes || null,
        snoringPercent: data.additionalMetrics?.snoringPercent || null,
        legMovementIndex: data.additionalMetrics?.legMovementIndex || null,
        leftPositionIndex: data.additionalMetrics?.leftPositionIndex || null,
        rightPositionIndex: data.additionalMetrics?.rightPositionIndex || null,
        supinePositionIndex: data.additionalMetrics?.supinePositionIndex || null,
        ahiLateral: data.additionalMetrics?.ahiLateral || null
      },
      titrationData: data.titrationData || {},
      clinicalSummary: data.clinicalSummary || null,
      recommendations: data.recommendations || [],
      patientComments: data.patientComments || [],
      studyType: data.studyInfo?.studyType || data.extractedData?.studyType || selectedStudyType,
      qualityAssurance: data.qualityAssurance || null,
      clinicalInterpretation: data.clinicalInterpretation || null,
      extractionMethod: data.extractionMethod || "unknown"
    };

    console.log("=== NORMALIZED DATA FOR UI ===");
    console.log(JSON.stringify(normalized, null, 2));
    
    setProcessedData(normalized);
    setReportCount(prev => prev + 1);
  };

  const handleNewReport = () => {
    setProcessedData(null);
    setReportCount(0);
    setHasUploadedFile(false);
  };

  if (processedData) {
    return (
      <ProcessedResults 
        data={processedData} 
        onNewReport={handleNewReport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Analysis Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Begin Your </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Analysis</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Configure your analysis settings and upload your sleep study report for instant AI processing.
            </p>
          </div>

          {/* Today's Activity Dashboard */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Today's Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-pulse-600" />
                </div>
                <div className="text-3xl font-bold text-pulse-600 mb-2 font-brockmann">
                  {reportCount}
                </div>
                <p className="text-muted-foreground text-sm font-medium">Reports Generated</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-pulse-600" />
                </div>
                <div className="text-3xl font-bold text-pulse-600 mb-2 font-brockmann">
                  &lt;45s
                </div>
                <p className="text-muted-foreground text-sm font-medium">Processing Time</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-pulse-600" />
                </div>
                <div className="text-3xl font-bold text-pulse-600 mb-2 font-brockmann">
                  100%
                </div>
                <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-pulse-600" />
                </div>
                <div className="text-3xl font-bold text-pulse-600 mb-2 font-brockmann">
                  0
                </div>
                <p className="text-muted-foreground text-sm font-medium">Recent Reports</p>
              </div>
            </div>

          </div>
          
          {/* Integrated Analysis Workflow */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Study Type Selection */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <StudyTypeSelector
                selectedType={selectedStudyType}
                onTypeSelect={setSelectedStudyType}
              />
            </div>
            
            {/* File Upload - Only show after study type is selected */}
            {selectedStudyType && (
              <div className="animate-scale-in">
                <EnhancedFileUpload
                  onFileProcessed={handleFileProcessed}
                  selectedStudyType={selectedStudyType}
                  onFileUploaded={setHasUploadedFile}
                />
              </div>
            )}
            
            {/* Progress Indicator */}
            {!selectedStudyType && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div className="w-16 h-px bg-border"></div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">2</div>
                  <div className="w-16 h-px bg-border"></div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">3</div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">Select study type to continue</p>
              </div>
            )}
            
            {selectedStudyType && !hasUploadedFile && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <div className="w-16 h-px bg-success"></div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div className="w-16 h-px bg-border"></div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">3</div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">Upload your sleep study report</p>
              </div>
            )}
            
            {selectedStudyType && hasUploadedFile && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <div className="w-16 h-px bg-success"></div>
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <div className="w-16 h-px bg-success"></div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">3</div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">Ready for analysis</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};

export default Analysis;