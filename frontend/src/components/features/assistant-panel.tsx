"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useAnalysisStore } from "@/lib/store";
import { api } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AssistantPanel() {
  const { assistantOpen, setAssistantOpen } = useUIStore();
  const { currentResult } = useAnalysisStore();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", content: "Hi! I'm PackSmart AI. How can I help you with your packaging decisions today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await api.askAssistant(text, currentResult);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: result.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I encountered an error while processing your request." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Why this material?",
    "What about sustainability?",
    "Cost alternatives?"
  ];

  return (
    <AnimatePresence>
      {assistantOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setAssistantOpen(false)}
          />
          <motion.div
            initial={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            animate={{ x: 0, boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}
            exit={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-stone-900 sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                <Sparkles className="h-5 w-5" />
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">Ask PackSmart AI</h2>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"}`}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200"}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-3 flex-row">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions & Input Area */}
            <div className="border-t border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSend(sug)}
                    disabled={loading}
                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  >
                    {sug}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything..."
                  disabled={loading}
                  className="w-full rounded-full border border-stone-300 bg-stone-50 px-4 py-3 pr-12 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

