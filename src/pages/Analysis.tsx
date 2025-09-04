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
    setProcessedData(data);
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
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-6 h-6 text-primary mr-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {reportCount}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium font-body">Reports Generated</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-success mr-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-success to-success bg-clip-text text-transparent">
                    &lt;45s
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium font-body">Processing Time</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-premium mr-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-premium to-highlight bg-clip-text text-transparent">
                    100%
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium font-body">Success Rate</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-6 h-6 text-trust mr-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-trust to-trust-light bg-clip-text text-transparent">
                    0
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium font-body">Recent Reports</p>
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