"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceInputProps {
  onResult: (text: string, parsedData?: { commodity?: string; shelfLife?: number }) => void;
  language?: "en-US" | "hi-IN";
}

export function VoiceInput({ onResult, language = "en-US" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!supported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript) {
        parseAndEmit(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error === 'not-allowed' ? 'Microphone access denied' : 'Error recognizing speech');
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setError("Failed to start recording");
    }
  };

  const parseAndEmit = (text: string) => {
    // Simple heuristic parser for demo purposes
    let commodity = undefined;
    let shelfLife = undefined;
    
    const lowerText = text.toLowerCase();
    
    // Check for common commodities
    const commodities = ["strawberry", "potato", "apple", "turmeric", "tomato", "mango"];
    for (const c of commodities) {
      if (lowerText.includes(c)) {
        commodity = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // Check for days/weeks for shelf life
    const daysMatch = lowerText.match(/(\d+)\s*(days?|weeks?|months?)/);
    if (daysMatch) {
      const num = parseInt(daysMatch[1], 10);
      const unit = daysMatch[2];
      if (unit.startsWith("day")) shelfLife = num;
      if (unit.startsWith("week")) shelfLife = num * 7;
      if (unit.startsWith("month")) shelfLife = num * 30;
    }

    onResult(text, { commodity, shelfLife });
  };

  if (!supported) {
    return (
      <div className="group relative inline-flex items-center justify-center">
        <button disabled className="flex h-14 w-14 cursor-not-allowed items-center justify-center rounded-full bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          <MicOff size={24} />
        </button>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          Voice not available in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-emerald-500 opacity-20"
          />
        )}
        <button
          onClick={isListening ? () => {} : startListening}
          className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
            isListening 
              ? "bg-amber-500 text-white hover:bg-amber-600" 
              : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-900/20"
          }`}
        >
          <Mic size={24} className={isListening ? "animate-pulse" : ""} />
        </button>
      </div>

      <div className="h-6 text-center text-sm">
        {error && (
          <div className="flex items-center gap-1 text-red-500">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        {!error && isListening && (
          <span className="text-stone-600 dark:text-stone-400">
            {transcript || "Listening..."}
          </span>
        )}
      </div>
    </div>
  );
}
