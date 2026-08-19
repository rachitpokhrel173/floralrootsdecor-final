"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "About You" },
  { number: 2, label: "Your Event" },
  { number: 3, label: "Services" },
];

export function BookingStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const isComplete = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.08 : 1,
                }}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full border-2 font-display text-sm font-semibold transition-colors",
                  isComplete && "border-gold bg-gold text-white",
                  isActive && !isComplete && "border-gold text-gold bg-gold/10",
                  !isActive && !isComplete && "border-border text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-5 w-5" /> : step.number}
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="relative mx-2 mb-5 h-[2px] w-12 sm:w-24 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gold"
                  initial={false}
                  animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
