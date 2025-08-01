import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Zap, Heart } from "lucide-react";
import { StudyTypeSelector } from "@/components/StudyTypeSelector";
import { FileUpload } from "@/components/FileUpload";
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
    setReportCount(0);
  };

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
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
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col">
        {/* Header with Logo */}
        <div className="relative z-20 p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sleep Report AI</h2>
                <p className="text-sm text-white/70">Smarter reporting for sleep centers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                ● AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                ● Ready
              </Badge>
            </div>
          </div>
        </div>

        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex items-end relative z-10">
          <div className="container mx-auto px-6 pb-20">
            <div className="max-w-4xl">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight hero-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  AI Sleep Report Analysis.
                </h1>
                
                <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
                  Sleep Report AI is a web-based tool that helps sleep centers turn long, technical sleep study reports from G3 and other platforms into clean, accurate 2-page summaries in seconds.
                </p>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
                    🛡️ HIPAA Compliant
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
                    ⚡ 5-Second Processing
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                    🎯 99.8% Accuracy
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <Button 
                    size="lg" 
                    className="neon-glow-button text-lg px-8 py-6 h-auto font-medium"
                    onClick={scrollToUpload}
                  >
                    Start Analysis
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background" style={{ marginTop: '80px' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="feature-card border-0">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl neon-text">Accurate Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Extract key values directly from uploaded sleep reports.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl neon-text">Fast & Easy Upload</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Drag and drop .docx G3-format files for instant results.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl neon-text">Private & Secure</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  No data stored. All processing is local and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-20 bg-background" style={{ marginTop: '80px' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold neon-text">
              Begin Your Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your sleep report and select the type.
            </p>
            <p className="text-sm text-muted-foreground">
              Accepted File Format: .docx only
            </p>
          </div>
          
          <div className="space-y-8">
            <StudyTypeSelector
              selectedType={selectedStudyType}
              onTypeSelect={setSelectedStudyType}
            />
            
            <FileUpload
              onFileProcessed={handleFileProcessed}
              selectedStudyType={selectedStudyType}
            />
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="neon-glow-button text-lg px-8 py-6 h-auto font-medium"
              onClick={scrollToUpload}
            >
              Start Analysis
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;