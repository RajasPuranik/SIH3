"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ArrowRight, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";

interface WhatIfState {
  temperature: number;
  humidity: number;
  targetShelfLife: number;
}

export function WhatIfPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [originalState] = useState<WhatIfState>({ temperature: 20, humidity: 60, targetShelfLife: 14 });
  const [currentState, setCurrentState] = useState<WhatIfState>(originalState);
  
  const [result, setResult] = useState<{ shelfLife: number; deltaPercentage: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (
        currentState.temperature === originalState.temperature &&
        currentState.humidity === originalState.humidity &&
        currentState.targetShelfLife === originalState.targetShelfLife
      ) {
        setResult(null);
        return;
      }
      
      setIsSimulating(true);
      try {
        const res = await api.whatIf(currentState);
        setResult(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSimulating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [currentState, originalState]);

  const handleReset = () => {
    setCurrentState(originalState);
    setResult(null);
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div 
        className="flex cursor-pointer items-center justify-between bg-stone-50 px-6 py-4 transition-colors hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">What-If Simulator</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Test different environmental conditions</p>
          </div>
        </div>
        <div className="text-stone-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-stone-200 dark:border-stone-800"
          >
            <div className="p-6">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Sliders */}
                <div className="space-y-6 lg:col-span-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Temperature (°C)</label>
                      <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{currentState.temperature}°C</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={currentState.temperature}
                      onChange={(e) => setCurrentState({ ...currentState, temperature: Number(e.target.value) })}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-emerald-600 dark:bg-stone-700"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Relative Humidity (%)</label>
                      <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{currentState.humidity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentState.humidity}
                      onChange={(e) => setCurrentState({ ...currentState, humidity: Number(e.target.value) })}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-emerald-600 dark:bg-stone-700"
                    />
                  </div>
                  
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Target Shelf Life (days)</label>
                      <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{currentState.targetShelfLife} days</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={currentState.targetShelfLife}
                      onChange={(e) => setCurrentState({ ...currentState, targetShelfLife: Number(e.target.value) })}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-emerald-600 dark:bg-stone-700"
                    />
                  </div>
                </div>

                {/* Results Card */}
                <div className="flex flex-col rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-800/50">
                  <h4 className="mb-4 font-medium text-stone-900 dark:text-stone-100">Simulation Result</h4>
                  
                  <div className="flex-1">
                    {isSimulating ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      </div>
                    ) : result ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">Projected Shelf Life</div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-xl text-stone-400 line-through">{originalState.targetShelfLife}</span>
                            <ArrowRight className="h-4 w-4 text-stone-400" />
                            <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.shelfLife}</span>
                            <span className="text-sm text-stone-500">days</span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${result.deltaPercentage >= 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {result.deltaPercentage >= 0 ? "+" : ""}{result.deltaPercentage}% change
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-center text-sm text-stone-500">
                        Adjust the sliders to see how conditions affect shelf life.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleReset}
                    disabled={!result && !isSimulating}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  >
                    <RotateCcw size={16} />
                    Reset to Original
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
