"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";

const steps = [
  { target: "New Analysis", message: "Start by selecting your food product to begin a new packaging analysis." },
  { target: "Expert Mode", message: "Switch between simple and detailed views depending on your needs." },
  { target: "Material Catalog", message: "Browse 30+ packaging materials and their properties." },
  { target: "Theme", message: "Customize your experience with dark or light mode." }
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("packlabs_tour_seen");
    if (!hasSeenTour) {
      // Small delay before starting tour
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    setIsVisible(false);
    localStorage.setItem("packlabs_tour_seen", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex items-end justify-end">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-80 rounded-xl bg-emerald-600 p-5 text-white shadow-2xl"
        >
          {/* Mock pointer pointing top-left as a generic visual */}
          <div className="absolute -left-2 -top-2 h-4 w-4 rotate-45 bg-emerald-600" />
          
          <button 
            onClick={endTour}
            className="absolute right-3 top-3 rounded-full bg-emerald-700/50 p-1 text-emerald-100 hover:bg-emerald-700 hover:text-white"
          >
            <X size={14} />
          </button>
          
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Step {currentStep + 1} of {steps.length}
          </div>
          <h4 className="mb-2 font-semibold">{steps[currentStep].target}</h4>
          <p className="mb-4 text-sm text-emerald-50 leading-relaxed">
            {steps[currentStep].message}
          </p>
          
          <div className="flex items-center justify-between">
            <button 
              onClick={endTour}
              className="text-sm text-emerald-200 hover:text-white"
            >
              Skip tour
            </button>
            <button 
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
              {currentStep < steps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
