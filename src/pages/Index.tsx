import { useState } from "react";
import { Upload, Brain, Shield, Zap, Clock, Award, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudyTypeSelector } from "@/components/StudyTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import { ProcessedResults } from "@/components/ProcessedResults";
// import heroVideo from "@/assets/hero-video.mp4"; // Add your video file here
import heroBackground from "@/assets/hero-video-bg.jpg";

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

  if (processedData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ProcessedResults 
          data={processedData} 
          onNewReport={handleNewReport}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-end">
        {/* Background Video - Replace with your video file */}
        <div className="absolute inset-0">
          {/* Uncomment and add your video file:
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video> */}
          
          {/* Fallback background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
        </div>
        
        {/* Logo */}
        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold text-soft-white">Sleep Report AI</span>
          </div>
        </div>

        {/* Hero Content - Bottom Left */}
        <div className="relative z-10 p-12 pb-24 max-w-2xl">
          <h1 className="text-6xl font-light text-soft-white mb-6 leading-tight">
            AI-Powered
            <span className="block gradient-text font-normal">Sleep Study</span>
            <span className="block text-soft-white">Analysis</span>
          </h1>
          <p className="text-xl text-soft-white/90 mb-8 font-light leading-relaxed">
            Transform complex sleep data into precise, clinical insights. 
            Our AI whispers through data in the dark, delivering professional reports in seconds.
          </p>
          <div className="flex space-x-4">
            <Button 
              size="lg" 
              className="glow-button rounded-full px-8 py-3 text-lg font-light"
            >
              Start Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="accent-glow-button rounded-full px-8 py-3 text-lg font-light bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 -mt-16">
        {/* Features Section */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-foreground mb-4">
                Digital Sleep Lab <span className="gradient-text">Intelligence</span>
              </h2>
              <p className="text-xl medical-text max-w-2xl mx-auto">
                Advanced AI algorithms designed for clinical precision and seamless integration 
                into your medical practice workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="feature-card">
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-3">AI Analysis</h3>
                  <p className="medical-text">
                    Deep learning models trained on thousands of sleep studies for 
                    unparalleled accuracy and insight.
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-3">HIPAA Compliant</h3>
                  <p className="medical-text">
                    Enterprise-grade security ensuring patient data protection 
                    and regulatory compliance.
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent className="p-8 text-center">
                  <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-3">Instant Results</h3>
                  <p className="medical-text">
                    Generate comprehensive reports in seconds, not hours. 
                    Streamline your diagnostic workflow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-24 px-8 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-foreground mb-4">
                Begin Your <span className="gradient-text">Analysis</span>
              </h2>
              <p className="text-lg medical-text">
                Upload your sleep study file and select the study type for instant AI analysis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Study Type Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-4">Study Type</h3>
                  <StudyTypeSelector
                    selectedType={selectedStudyType}
                    onTypeSelect={setSelectedStudyType}
                  />
                </div>

                {/* Stats */}
                <Card className="glow-card">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-medium text-foreground mb-4">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="medical-text">Reports Processed</span>
                        <span className="text-secondary font-medium">{reportCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="medical-text">Average Processing Time</span>
                        <span className="text-accent font-medium">&lt; 30 seconds</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="medical-text">Accuracy Rate</span>
                        <span className="text-primary font-medium">99.7%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Upload */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-4">Upload Study File</h3>
                  <FileUpload
                    selectedStudyType={selectedStudyType}
                    onFileProcessed={handleFileProcessed}
                  />
                </div>

                {/* Supported Formats */}
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-medium text-foreground mb-4">Supported Studies</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="medical-text">PSG Studies</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-secondary rounded-full" />
                        <span className="medical-text">Home Sleep Tests</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        <span className="medical-text">Split Night</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="medical-text">MSLT Studies</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-light text-foreground mb-4">
              Trusted by <span className="gradient-text">Leading Medical Centers</span>
            </h2>
            <p className="text-lg medical-text mb-12 max-w-2xl mx-auto">
              Sleep Report AI is trusted by sleep medicine professionals worldwide 
              for accurate, reliable, and fast sleep study analysis.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glow-card text-center">
                <CardContent className="p-6">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-light text-foreground mb-1">10,000+</div>
                  <div className="medical-text">Studies Analyzed</div>
                </CardContent>
              </Card>

              <Card className="glow-card text-center">
                <CardContent className="p-6">
                  <Award className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <div className="text-2xl font-light text-foreground mb-1">500+</div>
                  <div className="medical-text">Medical Centers</div>
                </CardContent>
              </Card>

              <Card className="glow-card text-center">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
                  <div className="text-2xl font-light text-foreground mb-1">99.7%</div>
                  <div className="medical-text">Accuracy Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;