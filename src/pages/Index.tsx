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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Sleep Report Generator</h1>
                <p className="text-sm text-muted-foreground">Clinical Sleep Study Analysis Tool</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </div>
        </div>
      </header>

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
