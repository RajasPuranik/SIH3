"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  default: null,
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-danger" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
}

export function Toast({ id, title, description, variant = "default", duration = 5000, onClose }: ToastProps) {
  React.useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm flex-col gap-1 overflow-hidden rounded-xl border bg-background p-4 shadow-lg",
        variant === "error" && "border-danger/50",
        variant === "success" && "border-success/50",
        variant === "warning" && "border-warning/50",
        variant === "info" && "border-info/50"
      )}
    >
      <div className="flex items-start gap-3">
        {toastIcons[variant] && <div className="mt-0.5 shrink-0">{toastIcons[variant]}</div>}
        <div className="flex-1 space-y-1">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <button
          onClick={() => onClose(id)}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      {duration !== Infinity && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          style={{ originX: 0 }}
          className={cn(
            "absolute bottom-0 left-0 h-1 w-full bg-primary",
            variant === "error" && "bg-danger",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "info" && "bg-info"
          )}
        />
      )}
    </motion.div>
  )
}

// Toast Context & Hook
type ToastContextType = {
  toasts: ToastProps[]
  toast: (props: Omit<ToastProps, "id" | "onClose">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id, onClose: dismiss }])
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
