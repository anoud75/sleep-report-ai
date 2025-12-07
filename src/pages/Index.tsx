import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import ScrollableCardsSection from "@/components/ScrollableCardsSection";
import { TextReveal } from "@/components/TextReveal";
import HowItWorksAnimated from "@/components/HowItWorksAnimated";
import { InteractiveGridPattern } from "@/components/InteractiveGridPattern";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, isApproved, isOrgApproved, isSuperAdmin, isLoading } = useAuth();

  useEffect(() => {
    document.title = "Sleep Report AI";
  }, []);

  const navigateToAnalysis = () => {
    if (isLoading) {
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    if (isSuperAdmin) {
      navigate('/analysis');
      return;
    }

    if (!isApproved) {
      toast.info('Your account is pending approval');
      navigate('/pending-approval');
      return;
    }

    if (!isOrgApproved) {
      toast.info('Your organization is pending approval');
      navigate('/org-pending');
      return;
    }

    navigate('/analysis');
  };

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
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-pulse-50 to-background">
        {/* Interactive Grid Background */}
        <div className="absolute inset-0 z-0">
          <InteractiveGridPattern 
            width={40}
            height={40}
            squares={[32, 32]}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Main Heading */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-brockmann animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <span className="block mb-4 hover:text-pulse-600 transition-colors duration-500">
                Transform Sleep Studies
              </span>
              <span className="block gradient-text">
                Into Professional Reports
              </span>
            </h1>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center items-center animate-fade-in-up" style={{animationDelay: '1.4s'}}>
            <Button 
              onClick={navigateToAnalysis}
              size="lg"
              className="flex items-center gap-3"
              disabled={isLoading}
            >
              <Zap className="w-5 h-5" />
              Start Analysis
            </Button>
          </div>
        </div>
      </section>

      {/* About Section - Scroll Text Reveal */}
      <TextReveal>
        Sleep Report AI simplifies the way healthcare professionals handle sleep study data. Using reliable AI models, the system extracts core metrics and produces clear, structured reports all within seconds.
      </TextReveal>

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

      {/* How It Works Section - Animated */}
      <HowItWorksAnimated />

      {/* Contact Section */}
      <section id="contact-section" className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pulse-50 py-12 text-pulse-700 border-t border-pulse-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-10">
            {/* Branding */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-primary mb-3 gradient-text">Sleep Report AI</h2>
              <p className="text-sm leading-relaxed text-pulse-700 max-w-sm">
                AI-powered sleep study analysis delivering professional reports in seconds.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-pulse-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/analysis" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Start Analysis</a></li>
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Features</a></li>
                <li><a href="#contact-section" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Contact</a></li>
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-pulse-900 mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Help Center</a></li>
                <li><a href="#contact-section" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-pulse-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-pulse-700 hover:text-primary hover:underline transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-pulse-200 text-center">
            <p className="text-xs text-pulse-600">
              © 2025 Sleep Report AI. All rights reserved to <span className="text-primary font-semibold">Alanoud Alsamil</span>.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
