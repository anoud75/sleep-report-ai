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

  // Generate comb lines with varying heights to create arc effect
  const combLines = Array.from({ length: 80 }, (_, i) => {
    const normalizedPosition = i / 79;
    // Create arc curve using sine function
    const arcHeight = Math.sin(normalizedPosition * Math.PI) * 0.7 + 0.3;
    return {
      index: i,
      height: arcHeight,
    };
  });

  // Calculate step positions along the comb
  const stepPositions = steps.map((_, index) => {
    const position = (index + 1) / (steps.length + 1);
    return Math.floor(position * 79);
  });

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Comb Timeline */}
      <div className="hidden md:block">
        <div className="relative max-w-4xl mx-auto">
          {/* Comb Effect Container */}
          <div className="relative h-48 flex items-end justify-center gap-[2px]">
            {combLines.map((line, i) => {
              const isStepPosition = stepPositions.includes(i);
              const stepIndex = stepPositions.indexOf(i);
              const isActive = stepIndex === activeStep;
              const maxHeight = 140;
              const lineHeight = line.height * maxHeight;

              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center"
                  style={{ height: maxHeight }}
                >
                  {/* Date label above active step */}
                  {isStepPosition && isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 whitespace-nowrap"
                    >
                      <span className="text-sm font-brockmann font-semibold text-pulse-600">
                        {steps[stepIndex]?.date}
                      </span>
                    </motion.div>
                  )}

                  {/* Vertical line */}
                  <motion.div
                    className={cn(
                      "absolute bottom-0 rounded-full transition-all duration-300",
                      isStepPosition
                        ? isActive
                          ? "w-1 bg-pulse-500"
                          : "w-0.5 bg-pulse-300 cursor-pointer hover:bg-pulse-400"
                        : "w-[2px] bg-pulse-100"
                    )}
                    style={{
                      height: isStepPosition ? maxHeight * 0.9 : lineHeight,
                    }}
                    onClick={() => {
                      if (isStepPosition) setActiveStep(stepIndex);
                    }}
                  />

                  {/* Icon at bottom of step lines */}
                  {isStepPosition && (
                    <motion.div
                      className={cn(
                        "absolute -bottom-12 cursor-pointer transition-all duration-300",
                        isActive ? "scale-100" : "scale-75 opacity-60 hover:opacity-100"
                      )}
                      onClick={() => setActiveStep(stepIndex)}
                      whileHover={{ scale: isActive ? 1 : 0.85 }}
                    >
                      <div
                        className={cn(
                          "rounded-xl flex items-center justify-center transition-all duration-300",
                          isActive
                            ? "w-12 h-12 bg-gradient-to-br from-pulse-500 to-pulse-600 shadow-lg"
                            : "w-9 h-9 bg-pulse-100 border border-pulse-200"
                        )}
                      >
                        {(() => {
                          const Icon = steps[stepIndex]?.icon;
                          return Icon ? (
                            <Icon
                              className={cn(
                                "transition-all duration-300",
                                isActive ? "w-6 h-6 text-white" : "w-4 h-4 text-pulse-500"
                              )}
                            />
                          ) : null;
                        })()}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inactive dates on the side */}
          <div className="absolute right-0 top-0 flex flex-col gap-2">
            {steps.map((step, index) => {
              if (index === activeStep) return null;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className="text-xs font-brockmann text-muted-foreground hover:text-pulse-500 transition-colors text-right"
                >
                  {step.date}
                </button>
              );
            })}
          </div>

          {/* Active Step Content Below */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-20 text-center max-w-md mx-auto"
          >
            <h3 className="text-xl font-brockmann font-semibold text-foreground mb-2">
              {steps[activeStep]?.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {steps[activeStep]?.description}
            </p>
          </motion.div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === activeStep
                    ? "bg-pulse-500 w-6"
                    : "bg-pulse-200 hover:bg-pulse-300"
                )}
              />
            ))}
          </div>
        </div>
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
