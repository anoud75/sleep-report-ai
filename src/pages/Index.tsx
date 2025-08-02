import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Zap, Heart, Building2, Brain, Clock, CheckCircle } from "lucide-react";
import { StudyTypeSelector } from "@/components/StudyTypeSelector";
import { FileUpload } from "@/components/FileUpload";
import { ProcessedResults } from "@/components/ProcessedResults";
import { HowItWorksCarousel } from "@/components/HowItWorksCarousel";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";

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
      <Header />
      
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
            
            <button className="group flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <span className="font-medium">Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-24 bg-black relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-white">About </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Sleep Report AI
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing sleep medicine with cutting-edge AI technology that transforms 
              complex sleep study data into comprehensive, professional reports in under 60 seconds.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* AI-Powered Analysis */}
            <div className="group bg-gradient-to-br from-background/80 to-background/60 backdrop-blur border border-border/50 rounded-2xl p-8 hover:scale-105 transition-all duration-500 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <Brain className="h-10 w-10 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-4 group-hover:text-blue-100 transition-colors duration-300">
                AI-Powered Analysis
              </h3>
              <p className="text-white/70 leading-relaxed">
                Advanced machine learning algorithms analyze sleep study data with clinical-grade precision, 
                extracting key insights and patterns that enhance diagnostic accuracy.
              </p>
            </div>

            {/* Enterprise Security */}
            <div className="group bg-gradient-to-br from-background/80 to-background/60 backdrop-blur border border-border/50 rounded-2xl p-8 hover:scale-105 transition-all duration-500 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                  <Shield className="h-10 w-10 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-4 group-hover:text-green-100 transition-colors duration-300">
                Enterprise Security
              </h3>
              <p className="text-white/70 leading-relaxed">
                HIPAA-compliant infrastructure ensures patient data protection with end-to-end encryption, 
                secure processing, and strict privacy controls for healthcare professionals.
              </p>
            </div>

            {/* Lightning Fast */}
            <div className="group bg-gradient-to-br from-background/80 to-background/60 backdrop-blur border border-border/50 rounded-2xl p-8 hover:scale-105 transition-all duration-500 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                  <Zap className="h-10 w-10 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-4 group-hover:text-yellow-100 transition-colors duration-300">
                Lightning Fast
              </h3>
              <p className="text-white/70 leading-relaxed">
                Transform hours of manual report generation into seconds of automated processing, 
                allowing healthcare teams to focus on patient care rather than paperwork.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                99.7%
              </div>
              <p className="text-white/60 text-sm uppercase tracking-wider">Accuracy Rate</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                &lt;60s
              </div>
              <p className="text-white/60 text-sm uppercase tracking-wider">Processing Time</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                100%
              </div>
              <p className="text-white/60 text-sm uppercase tracking-wider">HIPAA Compliant</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <p className="text-white/60 text-sm uppercase tracking-wider">Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">How It </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">Works</span>
            </h2>
            <p className="text-xl text-white/70 leading-relaxed">
              Transform your sleep study reporting workflow with our automated AI processing system.
            </p>
          </div>
          
          <HowItWorksCarousel />
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl animate-float" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-r from-purple-500/3 to-pink-500/3 rounded-full blur-3xl animate-float" style={{animationDelay: '2.5s'}}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-white">Who It's </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">For</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Designed for healthcare professionals who demand accuracy, efficiency, and reliability in sleep medicine.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sleep Centers */}
              <div className="group bg-gradient-to-br from-background/80 to-background/60 backdrop-blur border border-border/50 rounded-2xl p-10 hover:scale-105 transition-all duration-500 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                    <Heart className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-white font-bold text-2xl group-hover:text-blue-100 transition-colors duration-300">
                    Sleep Centers
                  </h3>
                </div>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Streamline your workflow with automated report generation that reduces manual workload 
                  and improves diagnostic accuracy for better patient outcomes.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Reduce report generation time by 95%</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Improve diagnostic consistency</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Focus more time on patient care</span>
                  </div>
                </div>
              </div>

              {/* Hospital Units */}
              <div className="group bg-gradient-to-br from-background/80 to-background/60 backdrop-blur border border-border/50 rounded-2xl p-10 hover:scale-105 transition-all duration-500 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                    <Building2 className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-white font-bold text-2xl group-hover:text-purple-100 transition-colors duration-300">
                    Hospital Units
                  </h3>
                </div>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Generate consistent, professional reports instantly without manual effort, 
                  ensuring standardized documentation across your healthcare system.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Standardize reporting protocols</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Integrate with existing workflows</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Scale across multiple departments</span>
                  </div>
                </div>
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

      {/* Contact Section */}
      <section id="contact-section" className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ContactForm />
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