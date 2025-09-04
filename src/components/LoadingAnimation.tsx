import { Brain, Zap, Activity } from "lucide-react";

interface LoadingAnimationProps {
  message?: string;
}

export const LoadingAnimation = ({ message = "Processing sleep study..." }: LoadingAnimationProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border rounded-2xl p-8 max-w-md w-full mx-4">
        {/* Animated Icons */}
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="protocol-icon p-3 rounded-xl bg-blue-500/20 animate-bounce-subtle">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          <div className="protocol-icon p-3 rounded-xl bg-purple-500/20 animate-bounce-subtle" style={{animationDelay: '0.2s'}}>
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div className="protocol-icon p-3 rounded-xl bg-green-500/20 animate-bounce-subtle" style={{animationDelay: '0.4s'}}>
            <Activity className="w-6 h-6 text-green-400" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground font-jakarta">
            AI Analysis in Progress
          </h3>
          <p className="text-muted-foreground font-inter">
            {message}
          </p>
          
          {/* Animated Dots */}
          <div className="loading-dots justify-center">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>

        {/* Progress Shimmer */}
        <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </div>
    </div>
  );
};