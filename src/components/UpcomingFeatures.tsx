import { Moon, BarChart3, Bot } from "lucide-react";
import { ArcTimeline, TimelineStep } from "@/components/ui/arc-timeline";

const upcomingFeatures: TimelineStep[] = [
  {
    id: 1,
    title: "Three-Split Sleep Study",
    description: "Diagnostic → CPAP → BiPAP multi-phase support.",
    date: "Feb–Mar 2026",
    icon: Moon,
  },
  {
    id: 2,
    title: "Hypnogram Analyzer",
    description: "Visual sleep stage insights & anomaly detection.",
    date: "Mar–Apr 2026",
    icon: BarChart3,
  },
  {
    id: 3,
    title: "SleepTech Assistant Chatbot",
    description: "24/7 AI support for sleep technologists.",
    date: "Apr–May 2026",
    icon: Bot,
  },
];

const UpcomingFeatures = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-pulse-50 to-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pulse-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pulse-100 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="section-title">
            <span className="gradient-text">What's Launching Soon</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Upcoming features to enhance your sleep study workflow
          </p>
        </div>
        
        {/* Arc Timeline */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <ArcTimeline steps={upcomingFeatures} />
        </div>
      </div>
    </section>
  );
};

export default UpcomingFeatures;
