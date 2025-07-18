import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Activity, Clock, Users } from "lucide-react";

const Index = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Sleep Study Report</span>
                </CardTitle>
                <CardDescription>
                  Upload your G3 sleep study report (.docx format) to generate a professional PDF summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium">Drop your .docx file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                  </div>
                  <Button size="lg" className="mt-4">
                    Select File
                  </Button>
                </div>
                
                {/* Study Type Selection */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Select Study Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                      <span className="font-semibold">Diagnostic (PSG)</span>
                      <span className="text-xs text-muted-foreground">Baseline sleep assessment</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                      <span className="font-semibold">Titration</span>
                      <span className="text-xs text-muted-foreground">CPAP therapy study</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                      <span className="font-semibold">Split-Night</span>
                      <span className="text-xs text-muted-foreground">Diagnostic + CPAP</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">--</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No reports generated yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload your first sleep study to get started</p>
                </div>
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
      </main>
    </div>
  );
};

export default Index;
