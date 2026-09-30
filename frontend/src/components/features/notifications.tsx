"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, FileText, PackageCheck, ClockAlert } from "lucide-react";
import { create } from "zustand";

// Isolated store for notifications
type NotificationType = "report_saved" | "batch_complete" | "expiry_warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  markAllRead: () => void;
  clearAll: () => void;
  markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    { id: "1", type: "report_saved", message: "Strawberry Shelf Life Report saved successfully.", time: "2 min ago", read: false },
    { id: "2", type: "batch_complete", message: "Analysis batch for Tomatoes is complete.", time: "1 hour ago", read: false },
    { id: "3", type: "expiry_warning", message: "Warning: Potato sample #42 nearing max shelf life.", time: "3 hours ago", read: true },
  ],
  markAllRead: () => set((state) => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) })),
  clearAll: () => set({ notifications: [] }),
  markRead: (id) => set((state) => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))
}));

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAllRead, clearAll, markRead } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "report_saved": return <FileText className="h-4 w-4 text-blue-500" />;
      case "batch_complete": return <PackageCheck className="h-4 w-4 text-emerald-500" />;
      case "expiry_warning": return <ClockAlert className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900">
            <span className="sr-only">{unreadCount} unread</span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800 sm:w-96"
            >
              <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-stone-800">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">Notifications</h3>
                <div className="flex gap-2">
                  <button onClick={markAllRead} className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-emerald-600 dark:hover:bg-stone-800" title="Mark all read">
                    <Check size={16} />
                  </button>
                  <button onClick={clearAll} className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-red-500 dark:hover:bg-stone-800" title="Clear all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-stone-500">
                    No new notifications
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, i) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex gap-4 border-b border-stone-100 px-4 py-3 last:border-0 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/50 ${!notif.read ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}
                        onMouseEnter={() => !notif.read && markRead(notif.id)}
                      >
                        <div className="mt-1 shrink-0 rounded-full bg-stone-100 p-2 dark:bg-stone-800">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={`text-sm ${notif.read ? "text-stone-600 dark:text-stone-300" : "font-medium text-stone-900 dark:text-stone-100"}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-stone-400">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
