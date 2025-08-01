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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col">
        {/* Header with Logo */}
        <div className="relative z-20 p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12c3-1 6-2 10 0s7 1 10 0"/>
                  <path d="M2 16c3-1 6-2 10 0s7 1 10 0"/>
                  <path d="M2 8c3-1 6-2 10 0s7 1 10 0"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sleep Report AI</h2>
                <p className="text-sm text-white/70">Smarter reporting for sleep centers</p>
              </div>
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
        <div className="flex-1 flex items-center relative z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl">
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AI Sleep Report</span>
                  <br />
                  <span className="text-white">Analysis</span>
                </h1>
                
                <p className="text-lg text-white/70 leading-relaxed">
                  Sleep Report AI is a web-based tool that helps sleep centers turn long, technical sleep study reports from G3 and other platforms into clean, accurate 2-page summaries in seconds.
                </p>
                
                <div className="flex items-center gap-6 pt-4">
                  <button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    onClick={scrollToUpload}
                  >
                    Start Analysis
                  </button>
                  <button className="text-blue-400 font-medium hover:text-blue-300 transition-colors flex items-center gap-2">
                    <div className="w-4 h-4 border border-blue-400 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[3px] border-l-blue-400 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent ml-[1px]"></div>
                    </div>
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="relative z-10 text-center pb-8">
          <h3 className="text-2xl font-light">
            <span className="text-white">Digital Sleep Lab </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span>
          </h3>
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

      {/* Upload Section */}
      <section id="upload-section" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-white">Begin Your </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Analysis</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Upload your sleep study file and select the study type for instant AI analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Study Type Section */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Study Type</h3>
              <p className="text-white/70 mb-6">Select Study Type</p>
              <StudyTypeSelector
                selectedType={selectedStudyType}
                onTypeSelect={setSelectedStudyType}
              />
            </div>
            
            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Upload Study File</h3>
              <FileUpload
                onFileProcessed={handleFileProcessed}
                selectedStudyType={selectedStudyType}
              />
              
              {/* Start Analysis Button - Moved closer to upload */}
              <div className="text-center mt-8">
                <button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  onClick={scrollToUpload}
                >
                  Start Analysis
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Grid - Supported Studies and Who It's For */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mt-20">
            {/* Supported Studies */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Supported Studies</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div>
                    <span className="text-white font-medium">PSG – Diagnostic Studies</span>
                    <p className="text-white/70 text-sm">Complete polysomnography</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <span className="text-white font-medium">TIT – CPAP Titration</span>
                    <p className="text-white/70 text-sm">Pressure optimization</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <span className="text-white font-medium">SPL – Split-Night</span>
                    <p className="text-white/70 text-sm">Hybrid diagnostic + titration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Who It's For */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Who It's For</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-white font-medium mb-1">Sleep Centers</h5>
                  <p className="text-white/70 text-sm">Reduce workload and improve accuracy with automated reports</p>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-1">Hospital Units</h5>
                  <p className="text-white/70 text-sm">Generate consistent reports instantly without manual effort</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Tags */}
      <section className="py-12 bg-black border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-white/70">🔒 HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              <span className="text-white/70">⚡ 5-Second Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-400/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              </div>
              <span className="text-white/70">🎯 99.8% Accuracy</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;