import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Zap, Heart, Building2, Brain, Clock, CheckCircle } from "lucide-react";
import { StudyTypeSelector } from "@/components/StudyTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import { ProcessedResults } from "@/components/ProcessedResults";

const Index = () => {
  const [selectedStudyType, setSelectedStudyType] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [reportCount, setReportCount] = useState(0);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const handleFileProcessed = (data: any) => {
    setProcessedData(data);
    setReportCount(prev => prev + 1);
  };

  const handleNewReport = () => {
    setProcessedData(null);
    setReportCount(0);
    setHasUploadedFile(false);
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/src/assets/hero-video-bg.jpg" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          
          {/* Animated Background Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full animate-float"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-300/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Company Badge */}
          <div className="animate-fade-in-up mb-8" style={{animationDelay: '0.2s'}}>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">
                Sleep Report AI - Powered by Advanced Machine Learning
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl md:text-7xl font-bold animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <span className="block text-white mb-4 hover:text-blue-100 transition-colors duration-500">
                Transform Sleep Studies
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Into Professional Reports
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              Upload your .docx sleep study files and instantly generate comprehensive, 
              professional PDF reports with AI-powered analysis and clinical insights.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300">
                  <Shield className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-green-100 transition-colors duration-300">HIPAA Compliant</h3>
              <p className="text-white/70 text-sm">Secure processing with enterprise-grade privacy protection</p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '1s'}}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Clock className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-blue-100 transition-colors duration-300">Under 60 Seconds</h3>
              <p className="text-white/70 text-sm">Lightning-fast AI processing for immediate results</p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '1.2s'}}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-300">
                  <Brain className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-purple-100 transition-colors duration-300">99.7% Accuracy</h3>
              <p className="text-white/70 text-sm">Clinical-grade precision in every analysis</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{animationDelay: '1.4s'}}>
            <button 
              onClick={scrollToUpload}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)]"
            >
              <span className="relative z-10">Start Analysis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            </button>
            
            <button className="group flex items-center gap-3 text-white/80 hover:text-white px-6 py-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <span className="font-medium">Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-white">How It </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-white/70">
              Transform your sleep study reporting workflow with automated processing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Reading</h3>
              <p className="text-white/70">
                Reads .docx reports from G3 and other systems automatically
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,11 12,14 22,4"></polyline>
                  <path d="m21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.73 0 3.34.49 4.71 1.34"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Key Value Extraction</h3>
              <p className="text-white/70">
                Finds key values (AHI, sleep time, oxygen, arousals…) precisely
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional Summary</h3>
              <p className="text-white/70">
                Writes a professional summary based on study type
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m16 3 4 4-4 4"></path>
                  <path d="M20 7H4"></path>
                  <path d="m8 21-4-4 4-4"></path>
                  <path d="M4 17h16"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Review & Edit</h3>
              <p className="text-white/70">
                Lets users review and edit the final report before saving
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">PDF Generation</h3>
              <p className="text-white/70">
                Generates a clean, ready-to-print PDF in seconds
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Time Savings</h3>
              <p className="text-white/70">
                Fast, consistent, professional reports with no manual work
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-white">Who It's </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">For</span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-blue-400" />
                  </div>
                  <h5 className="text-white font-semibold text-xl">Sleep Centers</h5>
                </div>
                <p className="text-white/70 text-lg leading-relaxed">Reduce workload and improve accuracy with automated reports</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-purple-400" />
                  </div>
                  <h5 className="text-white font-semibold text-xl">Hospital Units</h5>
                </div>
                <p className="text-white/70 text-lg leading-relaxed">Generate consistent reports instantly without manual effort</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-20 bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-500/3 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-white">Begin Your </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">Analysis</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Configure your analysis settings and upload your sleep study report for instant AI processing.
            </p>
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
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  selectedStudyType={selectedStudyType}
                  onFileUploaded={setHasUploadedFile}
                />
              </div>
            )}
            
            {/* Progress Indicator */}
            {!selectedStudyType && (
              <div className="text-center py-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center justify-center gap-4 text-white/40">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold animate-pulse-glow">1</div>
                  <div className="w-16 h-px bg-white/20"></div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/40 text-sm font-bold">2</div>
                  <div className="w-16 h-px bg-white/20"></div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/40 text-sm font-bold">3</div>
                </div>
                <p className="text-white/60 mt-4 text-sm">Select study type to continue</p>
              </div>
            )}
            
            {selectedStudyType && !hasUploadedFile && (
              <div className="text-center py-8 animate-scale-in">
                <div className="flex items-center justify-center gap-4 text-white/40">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <div className="w-16 h-px bg-green-500 animate-shimmer bg-[length:200%_100%]"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold animate-pulse-glow">2</div>
                  <div className="w-16 h-px bg-white/20"></div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/40 text-sm font-bold">3</div>
                </div>
                <p className="text-white/60 mt-4 text-sm">Upload your sleep study report</p>
              </div>
            )}
            
            {selectedStudyType && hasUploadedFile && (
              <div className="text-center py-8 animate-scale-in">
                <div className="flex items-center justify-center gap-4 text-white/40">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <div className="w-16 h-px bg-green-500 animate-shimmer bg-[length:200%_100%]"></div>
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <div className="w-16 h-px bg-green-500 animate-shimmer bg-[length:200%_100%]"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold animate-pulse-glow">3</div>
                </div>
                <p className="text-white/60 mt-4 text-sm">Ready for analysis</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8 relative overflow-hidden">
        {/* Subtle background animation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 w-32 h-32 bg-blue-500/2 rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center animate-fade-in-up">
            <h3 className="text-2xl font-light hover:scale-105 transition-transform duration-300 cursor-default">
              <span className="text-white">Digital Sleep Lab </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">Intelligence</span>
            </h3>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;