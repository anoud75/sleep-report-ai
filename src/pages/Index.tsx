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
                  <span className="text-white">AI-Powered</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Sleep Study</span>
                  <br />
                  <span className="text-white">Analysis</span>
                </h1>
                
                <p className="text-lg text-white/70 leading-relaxed">
                  Transform complex sleep data into precise, clinical insights. Our AI whispers through data in the dark, delivering professional reports in seconds.
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
              <span className="text-white">Digital Sleep Lab </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span>
            </h2>
            <p className="text-lg text-white/70">
              Advanced AI algorithms designed for clinical precision and seamless integration into your medical practice workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Analysis</h3>
              <p className="text-white/70">
                Deep learning models trained on thousands of sleep studies for unparalleled accuracy and insight.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">HIPAA Compliant</h3>
              <p className="text-white/70">
                Enterprise-grade security ensuring patient data protection and regulatory compliance.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Results</h3>
              <p className="text-white/70">
                Generate comprehensive reports in seconds, not hours. Streamline your diagnostic workflow.
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
              
              {/* Quick Stats */}
              <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Reports Processed</span>
                    <span className="text-green-400 font-semibold">{reportCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Average Processing Time</span>
                    <span className="text-blue-400 font-semibold">&lt; 30 seconds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Accuracy Rate</span>
                    <span className="text-purple-400 font-semibold">99.7%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Upload Study File</h3>
              <FileUpload
                onFileProcessed={handleFileProcessed}
                selectedStudyType={selectedStudyType}
              />
              
              {/* Supported Studies */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4">Supported Studies</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/70">PSG Studies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/70">Home Sleep Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/70">Split Night</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/70">MSLT Studies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-white">Trusted by </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">Leading Medical Centers</span>
            </h2>
            <p className="text-lg text-white/70">
              Sleep Report AI is trusted by sleep medicine professionals worldwide for accurate, reliable, and fast sleep study analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/70">Studies Analyzed</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m0 0a2 2 0 0 0-3-3 2 2 0 0 0 3 3Z"/>
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-white/70">Medical Centers</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">99.7%</div>
              <div className="text-white/70">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;