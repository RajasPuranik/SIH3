"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useAnalysisStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const STAGES = [
  "Reading food profile",
  "Evaluating barrier needs",
  "Matching materials",
  "Predicting shelf life",
  "Scoring sustainability"
];

export default function AnalyzingTransitionPage() {
  const router = useRouter();
  const currentInput = useAnalysisStore((state: any) => state.currentInput);
  const setCurrentResult = useAnalysisStore((state: any) => state.setCurrentResult);
  const [activeStage, setActiveStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [apiResultId, setApiResultId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentInput) {
      router.replace("/analyze");
      return;
    }

    // Call API immediately, animation runs in parallel
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commodity_id: currentInput.commodityId,
        commodity_name: currentInput.commodityName,
        category: "Fresh Produce",
        moisture_pct: currentInput.moisture,
        oil_fat_pct: currentInput.oil,
        ph: currentInput.ph,
        respiration_rate_class: currentInput.respiration,
        storage_temp_c: currentInput.storageTemp,
        relative_humidity_pct: currentInput.relativeHumidity,
        transit_duration_days: 0,
        transit_temp_c: currentInput.storageTemp,
        target_shelf_life_days: currentInput.shelfLife,
        eco_friendly_only: currentInput.ecoFriendlyOnly,
        weights: {
          cost: currentInput.costPriority,
          protection: currentInput.protectionPriority,
          sustainability: currentInput.sustainabilityPriority
        }
      })
    }).then(res => res.json()).then(data => {
      setCurrentResult(data);
      setApiResultId(data.id);
    }).catch(err => {
      console.error(err);
      // Fallback mock id if backend fails so UI doesn't hang
      setApiResultId(Math.random().toString(36).substring(7));
    });

    const stageInterval = 500; // ms per stage
    let currentStage = 0;

    const intervalId = setInterval(() => {
      currentStage++;
      if (currentStage <= STAGES.length) {
        setActiveStage(currentStage);
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
      }
    }, stageInterval);

    return () => clearInterval(intervalId);
  }, [currentInput, router, setCurrentResult]);

  useEffect(() => {
    if (isComplete && apiResultId) {
      setTimeout(() => {
        router.push(`/report/${apiResultId}`);
      }, 600);
    }
  }, [isComplete, apiResultId, router]);

  const skipAnimation = () => {
    if (apiResultId) {
      router.push(`/report/${apiResultId}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-emerald-500 rounded-full blur-xl"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-md p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PackSmart AI is Analyzing</h1>
          <p className="text-stone-400 mt-2 text-sm">Running computational models on {currentInput?.commodityName || 'your product'}...</p>
        </motion.div>

        <div className="space-y-6">
          {STAGES.map((stage, index) => {
            const isPast = activeStage > index;
            const isCurrent = activeStage === index;
            
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isPast || isCurrent ? 1 : 0.3, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {isPast ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-500 bg-emerald-500/20 rounded-full p-1"
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
                    />
                  ) : (
                    <div className="w-2 h-2 bg-stone-700 rounded-full" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isPast ? 'text-stone-300' : isCurrent ? 'text-emerald-400' : 'text-stone-600'}`}>
                  {stage}
                </span>
              </motion.div>
            );
          })}
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center text-emerald-400 text-sm font-medium"
          >
            Finalizing report...
          </motion.div>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={skipAnimation}
        className="absolute bottom-8 right-8 text-stone-500 hover:text-white hover:bg-stone-800"
      >
        Skip Animation
      </Button>
    </div>
  );
}
