"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Info, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAnalysisStore, useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// --- Data ---
const COMMODITIES = [
  { id: "1", name: 'Apple', category: 'Fruits', emoji: '🍎', moisture: 85, oil: 0.2, ph: 3.5, respiration: 'Medium' },
  { id: "2", name: 'Banana', category: 'Fruits', emoji: '🍌', moisture: 75, oil: 0.3, ph: 5.0, respiration: 'High' },
  { id: "3", name: 'Tomato', category: 'Vegetables', emoji: '🍅', moisture: 95, oil: 0.2, ph: 4.5, respiration: 'Medium' },
  { id: "4", name: 'Potato', category: 'Vegetables', emoji: '🥔', moisture: 79, oil: 0.1, ph: 5.8, respiration: 'Low' },
  { id: "5", name: 'Wheat', category: 'Grains', emoji: '🌾', moisture: 12, oil: 2.0, ph: 6.0, respiration: 'Very Low' },
  { id: "6", name: 'Rice', category: 'Grains', emoji: '🍚', moisture: 12, oil: 1.0, ph: 6.5, respiration: 'Very Low' },
  { id: "7", name: 'Almonds', category: 'Snacks', emoji: '🥜', moisture: 4, oil: 50.0, ph: 6.0, respiration: 'Very Low' },
  { id: "8", name: 'Milk Powder', category: 'Dairy', emoji: '🥛', moisture: 3, oil: 26.0, ph: 6.8, respiration: 'None' },
  { id: "9", name: 'Coffee Beans', category: 'Beverages', emoji: '☕', moisture: 5, oil: 15.0, ph: 5.0, respiration: 'Very Low' },
  { id: "10", name: 'Chips', category: 'Snacks', emoji: '🍟', moisture: 2, oil: 35.0, ph: 6.0, respiration: 'None' },
  { id: "11", name: 'Orange', category: 'Fruits', emoji: '🍊', moisture: 87, oil: 0.1, ph: 3.3, respiration: 'Medium' },
  { id: "12", name: 'Grapes', category: 'Fruits', emoji: '🍇', moisture: 81, oil: 0.2, ph: 3.5, respiration: 'Low' },
  { id: "13", name: 'Carrot', category: 'Vegetables', emoji: '🥕', moisture: 88, oil: 0.2, ph: 6.0, respiration: 'Low' },
  { id: "14", name: 'Onion', category: 'Vegetables', emoji: '🧅', moisture: 89, oil: 0.1, ph: 5.5, respiration: 'Low' },
  { id: "15", name: 'Lentils', category: 'Pulses', emoji: '🧆', moisture: 10, oil: 1.0, ph: 6.2, respiration: 'Very Low' },
  { id: "16", name: 'Black Pepper', category: 'Spices', emoji: '🌶️', moisture: 10, oil: 3.0, ph: 6.0, respiration: 'None' },
  { id: "17", name: 'Cheese', category: 'Dairy', emoji: '🧀', moisture: 35, oil: 30.0, ph: 5.5, respiration: 'None' },
  { id: "18", name: 'Bread', category: 'Bakery', emoji: '🍞', moisture: 35, oil: 3.0, ph: 5.5, respiration: 'None' },
  { id: "19", name: 'Chicken', category: 'Meat', emoji: '🍗', moisture: 75, oil: 5.0, ph: 6.0, respiration: 'None' },
  { id: "20", name: 'Fish', category: 'Fish', emoji: '🐟', moisture: 80, oil: 5.0, ph: 6.5, respiration: 'None' }
];

const CATEGORIES = ["All", "Fruits", "Vegetables", "Grains", "Pulses", "Spices", "Dairy", "Bakery", "Meat", "Fish", "Snacks", "Oils", "Beverages"];

// --- Schema ---
const formSchema = z.object({
  commodityId: z.string().min(1, "Please select a commodity"),
  commodityName: z.string(),
  moisture: z.number().min(0).max(100),
  oil: z.number().min(0).max(100),
  ph: z.number().min(0).max(14),
  respiration: z.string(),
  shelfLife: z.number().min(1).max(730),
  storageTemp: z.number().min(-40).max(60),
  relativeHumidity: z.number().min(0).max(100),
  transitCondition: z.string().min(1, "Please select transit condition"),
  storageType: z.string().min(1, "Please select storage type"),
  protectionPriority: z.number().min(0).max(1),
  costPriority: z.number().min(0).max(1),
  sustainabilityPriority: z.number().min(0).max(1),
  ecoFriendlyOnly: z.boolean(),
  packArea: z.number().positive()
});

type FormData = z.infer<typeof formSchema>;

const STEPS = ["Commodity", "Properties", "Storage & Transit", "Preferences"];

// --- Page Component ---
export default function AnalyzeWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setCurrentInput = useAnalysisStore((state: any) => state.setCurrentInput);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [shimmerFields, setShimmerFields] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commodityId: "",
      commodityName: "",
      moisture: 50,
      oil: 0,
      ph: 7,
      respiration: "Low",
      shelfLife: 30,
      storageTemp: 20,
      relativeHumidity: 60,
      transitCondition: "Local",
      storageType: "Ambient",
      protectionPriority: 0.33,
      costPriority: 0.33,
      sustainabilityPriority: 0.34,
      ecoFriendlyOnly: false,
      packArea: 0.06
    },
    mode: "onChange"
  });

  const { watch, setValue, formState: { isValid, errors } } = form;
  const values = watch();
  
  const mode = useSettingsStore((s: any) => s.mode);

  useEffect(() => {
    const draft = localStorage.getItem("analyze_draft");
    if (draft) {
      setShowDraftDialog(true);
    }
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("analyze_draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleResumeDraft = () => {
    const draft = localStorage.getItem("analyze_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        Object.entries(parsed).forEach(([key, val]) => {
          setValue(key as any, val, { shouldValidate: true });
        });
        toast({ title: "Draft restored", description: "Your previous progress has been loaded." });
      } catch(e) {}
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("analyze_draft");
    setShowDraftDialog(false);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await form.trigger(fieldsToValidate as any);
    if (isStepValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: FormData) => {
    setCurrentInput(data);
    router.push("/analyze/analyzing");
  };

  const getFieldsForStep = (step: number) => {
    switch(step) {
      case 0: return ["commodityId"];
      case 1: return ["moisture", "oil", "ph", "respiration"];
      case 2: return ["shelfLife", "storageTemp", "relativeHumidity", "transitCondition", "storageType"];
      case 3: return ["protectionPriority", "costPriority", "sustainabilityPriority", "ecoFriendlyOnly", "packArea"];
      default: return [];
    }
  };

  const handleCommoditySelect = (commodity: typeof COMMODITIES[0]) => {
    setValue("commodityId", commodity.id, { shouldValidate: true });
    setValue("commodityName", commodity.name);
    setValue("moisture", commodity.moisture);
    setValue("oil", commodity.oil);
    setValue("ph", commodity.ph);
    setValue("respiration", commodity.respiration);
    
    setShimmerFields(true);
    setTimeout(() => setShimmerFields(false), 2000);

    setTimeout(() => nextStep(), 600);
  };

  const filteredCommodities = COMMODITIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Risks for Radar
  const moistureRisk = values.moisture > 80 ? "high" : values.moisture > 50 ? "medium" : "low";
  const oxidationRisk = values.oil > 20 ? "high" : values.oil > 5 ? "medium" : "low";
  const microbialRisk = (values.moisture > 60 && values.ph > 4.5) ? "high" : "medium";
  const tempRisk = (values.storageTemp > 25) ? "high" : (values.storageTemp < 0) ? "medium" : "low";

  const getRiskColor = (risk: string) => {
    if (risk === "high") return "bg-red-500";
    if (risk === "medium") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "50%" : "-50%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "50%" : "-50%",
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-muted text-foreground pt-20 pb-24">
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume Draft?</DialogTitle>
            <DialogDescription>
              We found a saved draft of your analysis. Would you like to resume where you left off?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardDraft}>Start Fresh</Button>
            <Button onClick={handleResumeDraft} className="bg-emerald-600 hover:bg-emerald-700 text-white">Resume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isActive || isCompleted ? "#10B981" : "#E7E5E4",
                      borderColor: isActive ? "#047857" : isCompleted ? "#10B981" : "#D6D3D1",
                      scale: isActive ? 1.2 : 1
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-medium text-sm z-10 transition-colors",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : idx + 1}
                  </motion.div>
                  <span className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    isActive ? "text-emerald-700" : isCompleted ? "text-stone-700" : "text-stone-400"
                  )}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card shadow-xl shadow-stone-200/50 rounded-2xl overflow-hidden min-h-[600px] flex flex-col relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-grow p-6 sm:p-8"
                >
                  
                  {/* Step 1: Commodity */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">What are you packaging?</h2>
                        <p className="text-muted-foreground">Select a commodity to auto-fill baseline properties.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input 
                            placeholder="Search commodities..." 
                            className="pl-10 py-6 text-lg rounded-xl bg-muted"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                              selectedCategory === cat 
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                                : "bg-muted text-muted-foreground hover:bg-stone-200"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredCommodities.map((c) => {
                          const isSelected = values.commodityId === c.id;
                          return (
                            <motion.button
                              key={c.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCommoditySelect(c)}
                              className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all relative overflow-hidden",
                                isSelected 
                                  ? "border-emerald-500 bg-emerald-50" 
                                  : "border-border bg-card hover:border-emerald-200 hover:shadow-md"
                              )}
                            >
                              {isSelected && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute top-2 right-2 text-emerald-500"
                                >
                                  <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                                </motion.div>
                              )}
                              <span className="text-4xl mb-3">{c.emoji}</span>
                              <span className="font-semibold text-foreground text-sm text-center">{c.name}</span>
                              <Badge variant="outline" className="mt-2 text-xs bg-card text-muted-foreground">{c.category}</Badge>
                            </motion.button>
                          );
                        })}
                      </div>
                      {filteredCommodities.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No commodities found matching your criteria.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Properties */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Physicochemical Properties</h2>
                        <p className="text-muted-foreground">Adjust the baseline properties for your specific product.</p>
                      </div>

                      <div className={cn("space-y-8 p-6 rounded-2xl bg-muted border border-border transition-all", shimmerFields && "ring-2 ring-emerald-400 ring-offset-2 animate-pulse")}>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="font-semibold flex items-center gap-2">
                              Moisture Content (%)
                              <Tooltip content="Higher moisture requires better water vapor barriers."><Info className="w-4 h-4 text-stone-400"/></Tooltip>
                            </label>
                            <span className="font-mono bg-card px-2 py-1 rounded shadow-sm text-sm">{values.moisture.toFixed(1)}%</span>
                          </div>
                          <Controller
                            name="moisture"
                            control={form.control}
                            render={({ field }) => (
                              <Slider 
                                min={0} max={100} step={0.1}
                                value={[field.value]} 
                                onValueChange={([val]) => field.onChange(val)} 
                                className="py-2"
                              />
                            )}
                          />
                        </div>

                        {mode === 'expert' && (
                          <>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="font-semibold flex items-center gap-2">
                                  Oil/Fat Content (%)
                                  <Tooltip content="High fat products are prone to oxidation and need oxygen barriers."><Info className="w-4 h-4 text-stone-400"/></Tooltip>
                                </label>
                                <span className="font-mono bg-card px-2 py-1 rounded shadow-sm text-sm">{values.oil.toFixed(1)}%</span>
                              </div>
                              <Controller
                                name="oil"
                                control={form.control}
                                render={({ field }) => (
                                  <Slider 
                                    min={0} max={100} step={0.1}
                                    value={[field.value]} 
                                    onValueChange={([val]) => field.onChange(val)} 
                                  />
                                )}
                              />
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="font-semibold flex items-center gap-2">
                                  pH Level
                                  <Tooltip content="Low pH prevents microbial growth. Neutral pH needs more protection."><Info className="w-4 h-4 text-stone-400"/></Tooltip>
                                </label>
                                <span className="font-mono bg-card px-2 py-1 rounded shadow-sm text-sm">{values.ph.toFixed(1)}</span>
                              </div>
                              <Controller
                                name="ph"
                                control={form.control}
                                render={({ field }) => (
                                  <Slider 
                                    min={0} max={14} step={0.1}
                                    value={[field.value]} 
                                    onValueChange={([val]) => field.onChange(val)} 
                                  />
                                )}
                              />
                            </div>
                          </>
                        )}

                        {mode === 'expert' && (
                        <div className="space-y-3">
                          <label className="font-semibold flex items-center gap-2">
                            Respiration Rate
                            <Tooltip content="Fresh produce breathes. High respiration requires breathable films."><Info className="w-4 h-4 text-stone-400"/></Tooltip>
                          </label>
                          <Controller
                            name="respiration"
                            control={form.control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <option value="None">None</option>
                                <option value="Very Low">Very Low</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Very High">Very High</option>
                              </Select>
                            )}
                          />
                        </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* Step 3: Storage */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Storage & Transit</h2>
                        <p className="text-muted-foreground">Define the environmental conditions the package will face.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="font-semibold">Target Shelf Life (days)</label>
                          <Input 
                            type="number" 
                            {...form.register("shelfLife", { valueAsNumber: true })} 
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="font-semibold">Transit Condition</label>
                          <Controller
                            name="transitCondition"
                            control={form.control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <option value="Local">Local (Short distance)</option>
                                <option value="Road">Domestic Road</option>
                                <option value="Long-haul">Long-haul Road/Rail</option>
                                <option value="Export - Sea">Export - Sea Freight</option>
                                <option value="Export - Air">Export - Air Freight</option>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <label className="font-semibold">Storage Type</label>
                          <Controller
                            name="storageType"
                            control={form.control}
                            render={({ field }) => (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {["Ambient", "Cold Chain", "Controlled Atmosphere", "Frozen"].map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => field.onChange(type)}
                                    className={cn(
                                      "py-3 px-2 text-sm rounded-xl border-2 transition-all font-medium text-center",
                                      field.value === type 
                                        ? "border-amber-500 bg-amber-50 text-amber-900" 
                                        : "border-border bg-card text-muted-foreground hover:border-stone-300"
                                    )}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-3 md:col-span-2 mt-4">
                          <div className="flex justify-between items-center">
                            <label className="font-semibold">Average Storage Temperature (°C)</label>
                            <span className="font-mono bg-card px-2 py-1 rounded shadow-sm text-sm">{values.storageTemp}°C</span>
                          </div>
                          <Controller
                            name="storageTemp"
                            control={form.control}
                            render={({ field }) => (
                              <Slider min={-40} max={60} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} />
                            )}
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="font-semibold">Relative Humidity (%)</label>
                            <span className="font-mono bg-card px-2 py-1 rounded shadow-sm text-sm">{values.relativeHumidity}%</span>
                          </div>
                          <Controller
                            name="relativeHumidity"
                            control={form.control}
                            render={({ field }) => (
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Preferences */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Optimization Priorities</h2>
                        <p className="text-muted-foreground">How should the AI weigh different factors?</p>
                      </div>

                      <div className="bg-muted p-6 rounded-2xl border border-border space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Protection Priority</span>
                            <span>{Math.round(values.protectionPriority * 100)}%</span>
                          </div>
                          <Controller
                            name="protectionPriority"
                            control={form.control}
                            render={({ field }) => (
                              <Slider min={0} max={1} step={0.05} value={[field.value]} onValueChange={([v]) => field.onChange(v)} />
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Cost Efficiency</span>
                            <span>{Math.round(values.costPriority * 100)}%</span>
                          </div>
                          <Controller
                            name="costPriority"
                            control={form.control}
                            render={({ field }) => (
                              <Slider min={0} max={1} step={0.05} value={[field.value]} onValueChange={([v]) => field.onChange(v)} />
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Sustainability Focus</span>
                            <span>{Math.round(values.sustainabilityPriority * 100)}%</span>
                          </div>
                          <Controller
                            name="sustainabilityPriority"
                            control={form.control}
                            render={({ field }) => (
                              <Slider min={0} max={1} step={0.05} value={[field.value]} onValueChange={([v]) => field.onChange(v)} />
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
                        <div className="space-y-0.5">
                          <label className="font-semibold text-foreground">Strictly Eco-Friendly</label>
                          <p className="text-sm text-muted-foreground">Only recommend recyclable or compostable materials</p>
                        </div>
                        <Controller
                          name="ecoFriendlyOnly"
                          control={form.control}
                          render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="font-semibold">Package Surface Area (m²)</label>
                        <Controller
                          name="packArea"
                          control={form.control}
                          render={({ field }) => (
                            <Select value={field.value.toString()} onValueChange={(v) => field.onChange(parseFloat(v))}>
                              <option value="0.03">Small Pouch (~0.03m²)</option>
                              <option value="0.06">Medium Bag (~0.06m²)</option>
                              <option value="0.15">Large Sack (~0.15m²)</option>
                              <option value="0.5">Bulk Liner (~0.50m²)</option>
                            </Select>
                          )}
                        />
                      </div>

                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="p-6 bg-muted border-t border-border mt-auto flex justify-between items-center rounded-b-2xl">
                <Button 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="w-32"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button 
                    onClick={nextStep} 
                    className="w-32 bg-stone-900 text-white hover:bg-stone-800"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    className="w-40 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 font-semibold"
                  >
                    Run Analysis
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Live Risk Radar Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="p-6 border-border shadow-lg shadow-stone-200/50 rounded-2xl bg-card">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-foreground">Live Risk Radar</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Moisture Loss</span>
                      <span className="text-stone-400 capitalize">{moistureRisk}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full rounded-full", getRiskColor(moistureRisk))}
                        initial={{ width: 0 }}
                        animate={{ width: moistureRisk === "high" ? "85%" : moistureRisk === "medium" ? "50%" : "20%" }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Oxidation</span>
                      <span className="text-stone-400 capitalize">{oxidationRisk}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full rounded-full", getRiskColor(oxidationRisk))}
                        initial={{ width: 0 }}
                        animate={{ width: oxidationRisk === "high" ? "90%" : oxidationRisk === "medium" ? "60%" : "15%" }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Microbial Growth</span>
                      <span className="text-stone-400 capitalize">{microbialRisk}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full rounded-full", getRiskColor(microbialRisk))}
                        initial={{ width: 0 }}
                        animate={{ width: microbialRisk === "high" ? "80%" : microbialRisk === "medium" ? "45%" : "10%" }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Temperature Abuse</span>
                      <span className="text-stone-400 capitalize">{tempRisk}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full rounded-full", getRiskColor(tempRisk))}
                        initial={{ width: 0 }}
                        animate={{ width: tempRisk === "high" ? "75%" : tempRisk === "medium" ? "40%" : "10%" }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Radar updates in real-time based on your inputs. These risks determine the barrier requirements (OTR, WVTR) for optimal packaging.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
