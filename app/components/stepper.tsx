import { Check } from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

interface steps {
  id: number;
  name: string;
}

interface StepperProps {
  steps: steps[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav
      className="flex items-center justify-center mb-8"
      aria-label="Progress"
    >
      {steps.map((step, stepIdx) => (
        <React.Fragment key={step.name}>
          <div className="flex items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                currentStep >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-600",
              )}
            >
              <Check className="h-6 w-6" />
            </div>
            <span
              className={cn(
                "ml-3 text-sm font-medium",
                currentStep >= step.id ? "text-primary" : "text-gray-500",
              )}
            >
              {step.name}
            </span>
          </div>
          {stepIdx < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-16 mx-4",
                currentStep > step.id ? "bg-primary" : "bg-gray-200",
              )}
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
