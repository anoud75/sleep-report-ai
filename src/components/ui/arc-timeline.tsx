"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface TimelineStep {
  id: number;
  title: string;
  description: string;
  date: string;
  icon: LucideIcon;
}

interface ArcTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const ArcTimeline = ({ steps, className }: ArcTimelineProps) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Arc Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Arc SVG */}
          <svg
            viewBox="0 0 800 200"
            className="w-full h-auto max-w-4xl mx-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background Arc */}
            <path
              d="M 50 180 Q 400 20 750 180"
              fill="none"
              stroke="hsl(var(--pulse-200))"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Active Arc Progress */}
            <motion.path
              d="M 50 180 Q 400 20 750 180"
              fill="none"
              stroke="hsl(var(--pulse-500))"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: (activeStep + 1) / steps.length }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            
            {/* Timeline Points */}
            {steps.map((step, index) => {
              const t = index / (steps.length - 1);
              const x = 50 + t * 700;
              const y = 180 - (Math.sin(t * Math.PI) * 160);
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              
              return (
                <g key={step.id}>
                  {/* Connector line */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2="195"
                    stroke={isActive || isPast ? "hsl(var(--pulse-500))" : "hsl(var(--pulse-200))"}
                    strokeWidth="2"
                    strokeDasharray={isActive ? "0" : "4 2"}
                  />
                  
                  {/* Circle node */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isActive ? 16 : 12}
                    fill={isActive ? "hsl(var(--pulse-500))" : isPast ? "hsl(var(--pulse-400))" : "hsl(var(--pulse-100))"}
                    stroke={isActive ? "hsl(var(--pulse-600))" : "hsl(var(--pulse-300))"}
                    strokeWidth="3"
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setActiveStep(index)}
                    whileHover={{ scale: 1.2 }}
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      fill: isActive ? "hsl(var(--pulse-500))" : isPast ? "hsl(var(--pulse-400))" : "hsl(var(--pulse-100))"
                    }}
                  />
                  
                  {/* Step number */}
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    className="text-sm font-bold pointer-events-none select-none"
                    fill={isActive || isPast ? "white" : "hsl(var(--pulse-600))"}
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Date Labels */}
          <div className="flex justify-between max-w-4xl mx-auto px-8 -mt-2">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "text-sm font-brockmann transition-all duration-300 px-3 py-1 rounded-full",
                    isActive 
                      ? "text-primary bg-pulse-100" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {step.date}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Active Step Content */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-12 max-w-2xl mx-auto text-center"
        >
          <div className="glass-card p-8 border border-pulse-200 hover:border-pulse-400 transition-colors">
            <div className="w-16 h-16 bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {steps[activeStep] && (() => {
                const ActiveIcon = steps[activeStep].icon;
                return <ActiveIcon className="w-8 h-8 text-pulse-600" />;
              })()}
            </div>
            <h3 className="text-2xl font-brockmann text-foreground mb-3">
              {steps[activeStep]?.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {steps[activeStep]?.description}
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "glass-card p-6 border transition-all duration-300",
                index === activeStep
                  ? "border-pulse-500 shadow-lg"
                  : "border-pulse-200"
              )}
              onClick={() => setActiveStep(index)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pulse-100 to-pulse-200 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-pulse-600" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-brockmann text-pulse-500 mb-1 block">
                    {step.date}
                  </span>
                  <h3 className="text-lg font-brockmann text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
