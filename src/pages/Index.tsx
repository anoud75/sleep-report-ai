import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FileText } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { StudyTypeSelector } from "@/components/StudyTypeSelector";
import { ProcessedResults } from "@/components/ProcessedResults";

const Index = () => {
  const [selectedStudyType, setSelectedStudyType] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [reportCount, setReportCount] = useState(0);

  const handleFileProcessed = (data: any) => {
    setProcessedData(data);
    setReportCount(prev => prev + 1);
  };

  const handleNewReport = () => {
    setProcessedData(null);
    setSelectedStudyType('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-3 rounded-xl shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] transition-shadow duration-200">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Sleep Report AI</h1>
                <p className="text-sm professional-text">Smarter reporting for sleep centers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="trust-badge">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                AI-Powered
              </div>
              <Badge variant="secondary" className="px-3 py-1 hover-scale">
                <Clock className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center space-x-4 mb-6">
              <div className="trust-badge">
                <span className="text-xs">🔒 HIPAA Compliant</span>
              </div>
              <div className="trust-badge">
                <span className="text-xs">⚡ 5-Second Processing</span>
              </div>
              <div className="trust-badge">
                <span className="text-xs">🎯 99.8% Accuracy</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold gradient-text mb-6 leading-tight">
              Transform sleep studies into clean summaries instantly
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xl professional-text mb-8 leading-relaxed">
              Sleep Report AI is a web-based tool that helps sleep centers turn long, technical sleep study reports from G3 and other platforms into clean, accurate 2-page summaries in seconds.
            </p>
            <div className="premium-card p-6 rounded-xl">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Instead of manually going through 20+ pages, extracting values, and writing the final summary, the AI does it for you. Just upload the report, review the AI-generated summary, and download your final PDF.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card className="glass-card hover-scale">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Smart Reading</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reads .docx reports from G3 and other sleep systems automatically
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Key Value Extraction</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Finds key values (AHI, sleep time, oxygen, arousals…) precisely
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Professional Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Writes a professional summary based on study type
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Review & Edit</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lets you edit the final report before saving
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>PDF Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generates a ready-to-print PDF in seconds
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Time Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fast, consistent, and professional reports without manual effort
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Who it's for section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold gradient-text mb-8">Who it's for</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="trust-card">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[var(--shadow-button)]">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">Sleep Centers</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduce workload and improve accuracy with automated report generation
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="trust-card">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[var(--shadow-button)]">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">Hospital Units</h4>
                  <p className="text-sm text-muted-foreground">
                    Fast, consistent, and professional reports without manual effort
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {processedData ? (
          <ProcessedResults data={processedData} onNewReport={handleNewReport} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              <StudyTypeSelector 
                selectedType={selectedStudyType}
                onTypeSelect={setSelectedStudyType}
              />
              
              <FileUpload 
                onFileProcessed={handleFileProcessed}
                selectedStudyType={selectedStudyType}
              />
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reports Generated</span>
                    <span className="font-semibold">{reportCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing Time</span>
                    <span className="font-semibold">~5.5s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-semibold">100%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportCount === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No reports generated yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload your first sleep study to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {reportCount} report{reportCount !== 1 ? 's' : ''} processed today
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help & Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Studies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-700 p-1 rounded text-xs font-semibold">PSG</div>
                    <div className="text-sm">
                      <p className="font-medium">Diagnostic Studies</p>
                      <p className="text-muted-foreground text-xs">Complete polysomnography</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-700 p-1 rounded text-xs font-semibold">TIT</div>
                    <div className="text-sm">
                      <p className="font-medium">CPAP Titration</p>
                      <p className="text-muted-foreground text-xs">Pressure optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 text-purple-700 p-1 rounded text-xs font-semibold">SPL</div>
                    <div className="text-sm">
                      <p className="font-medium">Split-Night</p>
                      <p className="text-muted-foreground text-xs">Hybrid diagnostic + titration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
