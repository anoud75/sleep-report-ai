import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, Zap } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import ScrollableCardsSection from "@/components/ScrollableCardsSection";

const Index = () => {
  const navigate = useNavigate();

  // Set document title on component mount
  useEffect(() => {
    document.title = "Sleep Report AI";
  }, []);

  const navigateToAnalysis = () => {
    navigate('/analysis');
  };

  // Cards data for the scrollable section
  const featureCards = [
    {
      id: 1,
      title: "Accurate Analysis",
      subtitle: "Advanced AI algorithms ensure precise extraction of sleep study data with medical-grade accuracy",
    },
    {
      id: 2,
      title: "Fast Turnaround", 
      subtitle: "Transform hours of manual report processing into minutes of automated analysis and summary generation",
    },
    {
      id: 3,
      title: "Clinical Consistency",
      subtitle: "Standardized reporting format ensures consistent clinical documentation across all sleep studies",
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-pulse-50 to-background">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
            style={{ filter: 'brightness(0.7) contrast(1.1)' }}
          >
            <source src="https://cdn.midjourney.com/video/f6cee227-c4ac-48f9-acf8-eb9b1b060864/1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Main Heading */}
          <div className="space-y-6 mb-12">
            <h1 className="section-title animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <span className="block mb-4 hover:text-pulse-600 transition-colors duration-500">
                Transform Sleep Studies
              </span>
              <span className="block gradient-text">
                Into Professional Reports
              </span>
            </h1>
            <p className="section-subtitle mx-auto animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              AI-powered analysis that transforms complex sleep study data into clear, professional reports in minutes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{animationDelay: '1.4s'}}>
            <button 
              onClick={navigateToAnalysis}
              className="button-primary flex items-center gap-3 text-lg font-brockmann"
            >
              <Zap className="w-5 h-5" />
              Start Analysis
            </button>
            
            <button className="button-ghost group flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pulse-100 flex items-center justify-center group-hover:bg-pulse-200 transition-colors duration-300">
                <div className="w-0 h-0 border-l-[6px] border-l-pulse-600 border-y-[4px] border-y-transparent ml-1 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <span className="font-medium">Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <h2 className="section-title">
              <span className="gradient-text">
                About Sleep Report AI
              </span>
            </h2>
            <p className="section-subtitle mx-auto">
              Sleep Report AI simplifies the way healthcare professionals handle sleep study data. Using reliable AI models, 
              the system extracts core metrics and produces clear, structured reports — all within seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section - Scrollable Cards */}
      <ScrollableCardsSection
        cards={featureCards}
        title="Key Features"
        subtitle="Designed to reduce manual entry, shorten turnaround time, and maintain clinical consistency."
        sectionHeight="250vh"
        backgroundColor="bg-gradient-to-br from-pulse-50 to-background"
      />


      {/* Who Uses It Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="section-title">
              <span className="gradient-text">
                Who Uses It
              </span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pulse-100 to-pulse-200 rounded-2xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-pulse-600" />
                </div>
                <h3 className="text-foreground font-bold text-3xl font-brockmann">
                  Sleep Centers
                </h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Designed to help labs deliver accurate reports — faster, with less manual effort.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="feature-card group">
                  <CheckCircle className="text-pulse-600 w-5 h-5 mb-2" />
                  <span className="text-foreground">Minimize human error</span>
                </div>
                <div className="feature-card group">
                  <CheckCircle className="text-pulse-600 w-5 h-5 mb-2" />
                  <span className="text-foreground">Ensure consistent diagnostics</span>
                </div>
                <div className="feature-card group">
                  <CheckCircle className="text-pulse-600 w-5 h-5 mb-2" />
                  <span className="text-foreground">Standardize output across technicians</span>
                </div>
                <div className="feature-card group">
                  <CheckCircle className="text-pulse-600 w-5 h-5 mb-2" />
                  <span className="text-foreground">Free up time for patient care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-pulse-50 to-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="section-title">
              <span className="gradient-text">
                How It Works – In 3 Easy Steps
              </span>
            </h2>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="glass-card p-8 text-center group hover-lift">
                <div className="w-16 h-16 bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-foreground font-bold text-2xl font-brockmann mb-4">
                  Smart Reading
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Upload your .docx, .rtf, or .pdf sleep reports from G3 and similar systems.
                </p>
              </div>

              {/* Step 2 */}
              <div className="glass-card p-8 text-center group hover-lift">
                <div className="w-16 h-16 bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-foreground font-bold text-2xl font-brockmann mb-4">
                  Key Extraction & Summary
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Extracts essential sleep metrics and generates a clear summary.
                </p>
              </div>

              {/* Step 3 */}
              <div className="glass-card p-8 text-center group hover-lift">
                <div className="w-16 h-16 bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-foreground font-bold text-2xl font-brockmann mb-4">
                  Review & Export
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Lets you review, edit, and export a ready-to-print PDF in seconds.
                </p>
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
            <h3 className="text-2xl font-brockmann hover-lift cursor-default">
              <span className="text-foreground">Digital Sleep Lab </span>
              <span className="gradient-text">Intelligence</span>
            </h3>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;