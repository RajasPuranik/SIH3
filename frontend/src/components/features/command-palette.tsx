"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, PlusCircle, Package, History, Settings, Moon, Sun, Languages, Beaker, Apple, Carrot, Leaf } from "lucide-react";
import { useUIStore } from "@/lib/store";

type Command = {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: "Navigation" | "Actions" | "Quick Demos";
  action: () => void;
};

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [commandPaletteOpen]);

  const commands: Command[] = [
    { id: "nav-dash", name: "Go to Dashboard", icon: <LayoutDashboard size={18} />, shortcut: "G D", category: "Navigation", action: () => console.log("Dashboard") },
    { id: "nav-new", name: "New Analysis", icon: <PlusCircle size={18} />, shortcut: "N A", category: "Navigation", action: () => console.log("New Analysis") },
    { id: "nav-cat", name: "Material Catalog", icon: <Package size={18} />, shortcut: "M C", category: "Navigation", action: () => console.log("Material Catalog") },
    { id: "nav-trace", name: "Traceability", icon: <History size={18} />, shortcut: "T R", category: "Navigation", action: () => console.log("Traceability") },
    { id: "nav-settings", name: "Settings", icon: <Settings size={18} />, shortcut: "S E", category: "Navigation", action: () => console.log("Settings") },
    { id: "act-theme", name: "Toggle Theme", icon: <Moon size={18} />, shortcut: "T T", category: "Actions", action: () => console.log("Toggle Theme") },
    { id: "act-lang", name: "Toggle Language", icon: <Languages size={18} />, shortcut: "T L", category: "Actions", action: () => console.log("Toggle Language") },
    { id: "act-expert", name: "Toggle Expert Mode", icon: <Beaker size={18} />, shortcut: "T E", category: "Actions", action: () => console.log("Toggle Expert Mode") },
    { id: "quick-straw", name: "Fresh Strawberry Demo", icon: <Apple size={18} />, category: "Quick Demos", action: () => console.log("Strawberry Demo") },
    { id: "quick-potato", name: "Potato Chips Demo", icon: <Carrot size={18} />, category: "Quick Demos", action: () => console.log("Potato Chips Demo") },
    { id: "quick-turmeric", name: "Turmeric Demo", icon: <Leaf size={18} />, category: "Quick Demos", action: () => console.log("Turmeric Demo") },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter" && filteredCommands.length > 0) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setCommandPaletteOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"
          >
            <div className="flex items-center border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <Search className="mr-3 h-5 w-5 text-stone-500" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-500 outline-none dark:text-stone-100"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <kbd className="rounded border border-stone-200 px-1.5 py-0.5 font-mono dark:border-stone-700">ESC</kbd>
                to close
              </div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-14 text-center text-sm text-stone-500">No results found.</div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                        }`}
                        onClick={() => {
                          cmd.action();
                          setCommandPaletteOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${isSelected ? "text-emerald-600 dark:text-emerald-500" : "text-stone-400 dark:text-stone-500"}`}>
                            {cmd.icon}
                          </span>
                          <span>{cmd.name}</span>
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1 text-xs tracking-widest text-stone-400">
                            {cmd.shortcut.split(" ").map((key, i) => (
                              <kbd key={i} className="rounded bg-stone-100 px-1.5 py-0.5 font-mono dark:bg-stone-800">{key}</kbd>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

