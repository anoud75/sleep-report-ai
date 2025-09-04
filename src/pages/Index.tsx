import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, Zap } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { StackingFeatures } from "@/components/StackingFeatures";

const Index = () => {
  const navigate = useNavigate();

  // Set document title on component mount
  useEffect(() => {
    document.title = "Sleep Report AI";
  }, []);

  const navigateToAnalysis = () => {
    navigate('/analysis');
  };

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
            className="w-full h-full object-cover opacity-50"
            style={{ filter: 'brightness(0.7) contrast(1.1)' }}
          >
            <source src="https://cdn.midjourney.com/video/f6cee227-c4ac-48f9-acf8-eb9b1b060864/1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
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
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{animationDelay: '1.4s'}}>
            <button 
              onClick={navigateToAnalysis}
              className="luxury-button haptic-feedback text-white px-8 py-4 rounded-xl text-lg font-inter tracking-wide"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-5 h-5" />
                Start Analysis
              </span>
            </button>
            
            <button className="group flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 haptic-feedback">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <span className="font-medium font-inter">Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About Sleep Report AI
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Sleep Report AI simplifies the way healthcare professionals handle sleep study data. Using reliable AI models, 
              the system extracts core metrics and produces clear, structured reports — all within seconds.
            </p>
          </div>

      {/* Key Features Section - Stacking Cards */}
      <StackingFeatures />
        </div>
      </section>


      {/* Who Uses It Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Who Uses It
              </span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-10 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-trust/20 to-success/20 rounded-2xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-trust" />
                </div>
                <h3 className="text-foreground font-bold text-3xl font-heading">
                  Sleep Centers
                </h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-body">
                Designed to help labs deliver accurate reports — faster, with less manual effort.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-trust/5 hover:bg-trust/10 transition-all duration-300">
                  <CheckCircle className="text-trust w-5 h-5 mt-0.5" />
                  <span className="text-muted-foreground font-body">Minimize human error</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-trust/5 hover:bg-trust/10 transition-all duration-300">
                  <CheckCircle className="text-trust w-5 h-5 mt-0.5" />
                  <span className="text-muted-foreground font-body">Ensure consistent diagnostics</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-trust/5 hover:bg-trust/10 transition-all duration-300">
                  <CheckCircle className="text-trust w-5 h-5 mt-0.5" />
                  <span className="text-muted-foreground font-body">Standardize output across technicians</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-trust/5 hover:bg-trust/10 transition-all duration-300">
                  <CheckCircle className="text-trust w-5 h-5 mt-0.5" />
                  <span className="text-muted-foreground font-body">Free up time for patient care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact-section" className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <h3 className="text-2xl font-light hover:scale-105 transition-transform duration-300 cursor-default">
              <span className="text-foreground">Digital Sleep Lab </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">Intelligence</span>
            </h3>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;