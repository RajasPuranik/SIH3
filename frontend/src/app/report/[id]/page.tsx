"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Download, Copy, QrCode, BookmarkPlus, Share2, 
  ChevronRight, AlertTriangle, ShieldCheck, Leaf, DollarSign,
  TrendingUp, Info
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedNumber } from "@/components/animated/animated-number";
import { RevealOnScroll } from "@/components/animated/reveal-on-scroll";
import { Gauge } from "@/components/animated/gauge";
import { useAnalysisStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// --- API Data Mapper ---
const mapApiResultToReport = (apiData: any) => {
  const topRec = apiData.recommendations?.[0] || {};
  return {
    id: apiData.id,
    summary: {
      materialName: topRec.material_name || "Unknown Material",
      confidence: topRec.confidence || 0,
      tagline: apiData.plain_summary || "AI Recommendation",
      barrierClass: apiData.barrier_class || "Standard",
      ecoScore: apiData.eco_score || 0,
      predictedShelfLife: apiData.shelf_life?.predicted_days || 0,
      costPer1000: topRec.cost_per_1000_packs || 0
    },
    performance: {
      otr: { required: topRec.required_otr || 0, provided: topRec.provided_otr || 0, unit: "cc/m²/day" },
      wvtr: { required: topRec.required_wvtr || 0, provided: topRec.provided_wvtr || 0, unit: "g/m²/day" }
    },
    shelfLifeData: {
      target: apiData.input_summary?.target_shelf_life_days || 0,
      predicted: apiData.shelf_life?.predicted_days || 0,
      unpackaged: apiData.shelf_life?.unpackaged_baseline_days || 0,
      limitingFactor: apiData.shelf_life?.limiting_factor || "Unknown",
      q10: apiData.shelf_life?.q10_value || 0
    },
    recommendations: (apiData.recommendations || []).map((r: any) => ({
      id: r.material_id,
      rank: r.rank,
      name: r.material_name,
      score: r.overall_score,
      prot: r.protection_score,
      cost: r.cost_score,
      sust: r.sustainability_score,
      otr: r.provided_otr,
      wvtr: r.provided_wvtr,
      thick: r.recommended_thickness_um,
      price: r.cost_per_1000_packs || 0
    })),
    greenAlternative: apiData.green_alternative ? {
      available: true,
      name: apiData.green_alternative.material_name,
      compName: topRec.material_name,
      sustGain: `+${(apiData.green_alternative.sustainability_score - (topRec.sustainability_score||0)).toFixed(0)}%`,
      costDiff: `+${(apiData.green_alternative.cost_score - (topRec.cost_score||0)).toFixed(0)}%`,
      shelfLifeDiff: `${apiData.green_alternative.overall_score > topRec.overall_score ? '+' : ''}${(apiData.green_alternative.overall_score - topRec.overall_score).toFixed(0)}`
    } : { available: false },
    risks: (apiData.risk_flags || []).map((r: any) => ({
      type: r.type,
      message: r.message,
      level: r.severity === 'high' ? 'warning' : 'info'
    })),
    features: (apiData.feature_contributions || []).map((f: any) => ({
      name: f.feature,
      value: f.importance * 100
    }))
  };
};

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  
  const [report, setReport] = useState<any>(null);
  const currentInput = useAnalysisStore((state: any) => state.currentInput);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState("summary");

  useEffect(() => {
    fetch(`/api/report/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then(data => {
        setReport(mapApiResultToReport(data));
      })
      .catch(err => {
        setError(err.message);
      });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["summary", "performance", "shelflife", "materials", "insights"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!report) return <div className="min-h-screen flex items-center justify-center">Loading Report...</div>;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-24">
      {/* Actions Bar - Desktop */}
      <div className="fixed top-24 right-8 z-50 hidden xl:flex flex-col gap-3">
        <Button variant="outline" className="bg-white shadow-sm w-12 h-12 rounded-full p-0 flex items-center justify-center hover:text-emerald-600 hover:border-emerald-200 group" title="Download PDF">
          <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Button>
        <Button variant="outline" className="bg-white shadow-sm w-12 h-12 rounded-full p-0 flex items-center justify-center hover:text-emerald-600 hover:border-emerald-200 group" title="Copy Link">
          <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Button>
        <Button variant="outline" className="bg-white shadow-sm w-12 h-12 rounded-full p-0 flex items-center justify-center hover:text-emerald-600 hover:border-emerald-200 group" title="Save to Profile">
          <BookmarkPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Button>
        <Button variant="outline" className="bg-white shadow-sm w-12 h-12 rounded-full p-0 flex items-center justify-center hover:text-emerald-600 hover:border-emerald-200 group" title="Share">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">
        
        {/* Sticky Navigator */}
        <div className="hidden lg:block w-64 sticky top-28 flex-shrink-0">
          <nav className="space-y-1 border-l-2 border-stone-200 pl-4">
            {[
              { id: "summary", label: "Executive Summary" },
              { id: "performance", label: "Barrier Performance" },
              { id: "shelflife", label: "Shelf Life Prediction" },
              { id: "materials", label: "Recommendations" },
              { id: "insights", label: "AI Insights" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "block w-full text-left py-2 text-sm font-medium transition-colors relative",
                  activeSection === item.id ? "text-emerald-600" : "text-stone-500 hover:text-stone-900"
                )}
              >
                {activeSection === item.id && (
                  <motion.div layoutId="nav-indicator" className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-[2px] h-6 bg-emerald-500 rounded-r" />
                )}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-grow space-y-12 max-w-4xl">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-sm font-bold tracking-wider text-stone-500 uppercase mb-2">Analysis Report #{report.id.toUpperCase()}</h1>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">Packaging Specification</h2>
            <p className="text-lg text-stone-600 mt-2">Generated for {currentInput?.commodityName || 'Custom Product'}</p>
          </div>

          {/* Section: Summary */}
          <section id="summary" className="scroll-mt-28">
            <RevealOnScroll>
              <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white overflow-hidden relative border-0 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-64 h-64" />
                </div>
                <div className="p-8 sm:p-10 relative z-10">
                  <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 mb-4">{report.summary.barrierClass}</Badge>
                      <motion.h3 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-5xl font-black mb-4 leading-tight text-emerald-50"
                      >
                        {report.summary.materialName}
                      </motion.h3>
                      <p className="text-emerald-100/80 text-lg max-w-xl leading-relaxed">
                        {report.summary.tagline}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex flex-col items-center bg-black/20 p-6 rounded-2xl backdrop-blur-sm">
                      <Gauge value={report.summary.confidence} size={120} strokeWidth={10} color="#10B981" />
                      <span className="text-sm font-medium text-emerald-200 mt-3 uppercase tracking-wider">AI Confidence</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-emerald-800/50">
                    <div>
                      <div className="text-emerald-400 text-sm mb-1">Eco Score</div>
                      <div className="text-2xl font-bold font-mono">{report.summary.ecoScore}/100</div>
                    </div>
                    <div>
                      <div className="text-emerald-400 text-sm mb-1">Predicted Life</div>
                      <div className="text-2xl font-bold font-mono">{report.summary.predictedShelfLife}d</div>
                    </div>
                    <div>
                      <div className="text-emerald-400 text-sm mb-1">Est. Cost</div>
                      <div className="text-2xl font-bold font-mono">${report.summary.costPer1000.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-emerald-400 text-sm mb-1">Thickness</div>
                      <div className="text-2xl font-bold font-mono">60µm</div>
                    </div>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>
          </section>

          {/* Section: Barrier Performance */}
          <section id="performance" className="scroll-mt-28">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" /> Barrier Requirements
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <RevealOnScroll delay={0.1}>
                <Card className="p-6">
                  <h4 className="font-semibold text-stone-700 mb-6 text-center">Oxygen Transmission Rate (OTR)</h4>
                  <div className="flex justify-center mb-6">
                    <Gauge 
                      value={(report.performance.otr.provided / report.performance.otr.required) * 100} 
                      size={140} 
                      color={report.performance.otr.provided <= report.performance.otr.required ? "#10B981" : "#EF4444"}
                      showValue={false}
                    />
                  </div>
                  <div className="flex justify-between text-sm font-mono bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <div className="text-center">
                      <div className="text-stone-400 text-xs uppercase mb-1">Required (&lt;)</div>
                      <div className="font-semibold">{report.performance.otr.required}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-stone-400 text-xs uppercase mb-1">Provided</div>
                      <div className="font-bold text-emerald-600">{report.performance.otr.provided}</div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-stone-400 mt-3">{report.performance.otr.unit}</p>
                </Card>
              </RevealOnScroll>
              
              <RevealOnScroll delay={0.2}>
                <Card className="p-6">
                  <h4 className="font-semibold text-stone-700 mb-6 text-center">Water Vapor Tr. Rate (WVTR)</h4>
                  <div className="flex justify-center mb-6">
                    <Gauge 
                      value={(report.performance.wvtr.provided / report.performance.wvtr.required) * 100} 
                      size={140} 
                      color={report.performance.wvtr.provided <= report.performance.wvtr.required ? "#10B981" : "#EF4444"}
                      showValue={false}
                    />
                  </div>
                  <div className="flex justify-between text-sm font-mono bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <div className="text-center">
                      <div className="text-stone-400 text-xs uppercase mb-1">Required (&lt;)</div>
                      <div className="font-semibold">{report.performance.wvtr.required}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-stone-400 text-xs uppercase mb-1">Provided</div>
                      <div className="font-bold text-emerald-600">{report.performance.wvtr.provided}</div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-stone-400 mt-3">{report.performance.wvtr.unit}</p>
                </Card>
              </RevealOnScroll>
            </div>
          </section>

          {/* Section: Shelf Life */}
          <section id="shelflife" className="scroll-mt-28">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" /> Shelf Life Prediction
            </h3>
            <RevealOnScroll>
              <Card className="p-8">
                <div className="relative pt-8 pb-12">
                  <div className="h-4 bg-stone-100 rounded-full w-full overflow-hidden relative">
                    {/* Unpackaged */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-stone-300 z-10"
                      style={{ width: `${(report.shelfLifeData.unpackaged / report.shelfLifeData.predicted) * 100}%` }}
                    />
                    {/* Predicted */}
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute top-0 left-0 h-full bg-emerald-500 z-0"
                    />
                    {/* Target Marker */}
                    <div 
                      className="absolute top-0 h-full w-1 bg-stone-900 z-20"
                      style={{ left: `${(report.shelfLifeData.target / report.shelfLifeData.predicted) * 100}%` }}
                    />
                  </div>
                  
                  {/* Labels */}
                  <div 
                    className="absolute top-0 -translate-x-1/2 text-xs font-bold text-stone-500"
                    style={{ left: `${(report.shelfLifeData.unpackaged / report.shelfLifeData.predicted) * 100}%` }}
                  >
                    Unpackaged ({report.shelfLifeData.unpackaged}d)
                  </div>
                  
                  <div 
                    className="absolute -bottom-2 -translate-x-1/2 text-sm font-bold text-stone-900"
                    style={{ left: `${(report.shelfLifeData.target / report.shelfLifeData.predicted) * 100}%` }}
                  >
                    Target ({report.shelfLifeData.target}d)
                  </div>
                  
                  <div className="absolute right-0 top-0 text-sm font-bold text-emerald-600">
                    Predicted: {report.shelfLifeData.predicted} days
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-100 pt-6">
                  <div>
                    <div className="text-stone-500 text-sm mb-1">Limiting Factor</div>
                    <div className="font-semibold text-stone-800">{report.shelfLifeData.limitingFactor}</div>
                  </div>
                  <div>
                    <div className="text-stone-500 text-sm mb-1 flex items-center gap-1">
                      Temperature Sensitivity (Q10)
                      <Tooltip content="Rate of deterioration change per 10°C"><Info className="w-3 h-3"/></Tooltip>
                    </div>
                    <div className="font-semibold text-stone-800">{report.shelfLifeData.q10}</div>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>
          </section>

          {/* Section: Recommendations */}
          <section id="materials" className="scroll-mt-28">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" /> Ranked Material Options
            </h3>
            <div className="space-y-4">
              {report.recommendations.map((mat: any, idx: number) => (
                <RevealOnScroll key={mat.id} delay={idx * 0.1}>
                  <Card className={cn(
                    "p-6 transition-all hover:shadow-lg border-2",
                    idx === 0 ? "border-emerald-500 shadow-emerald-100/50" : "border-transparent"
                  )}>
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0",
                        idx === 0 ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-500"
                      )}>
                        #{mat.rank}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="text-xl font-bold text-stone-900">{mat.name}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-stone-500 font-mono">
                          <span>OTR: {mat.otr}</span>
                          <span>WVTR: {mat.wvtr}</span>
                          <span>{mat.thick}µm</span>
                        </div>
                      </div>

                      <div className="w-full sm:w-48 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-stone-500">Overall Match</span>
                          <span className="text-emerald-600">{mat.score}%</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${mat.score}%` }}
                            viewport={{ once: true }}
                            className="h-full bg-emerald-500 rounded-full" 
                          />
                        </div>
                        <div className="flex gap-1 mt-1">
                          <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${mat.prot}%` }} title="Protection" />
                          <div className="h-1 bg-amber-500 rounded-full" style={{ width: `${mat.cost}%` }} title="Cost" />
                          <div className="h-1 bg-green-500 rounded-full" style={{ width: `${mat.sust}%` }} title="Sustainability" />
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-stone-900 font-mono">${mat.price.toFixed(2)}</div>
                        <div className="text-xs text-stone-400">per 1000 packs</div>
                      </div>
                    </div>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>

            {report.greenAlternative?.available && (
              <RevealOnScroll delay={0.4}>
                <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Leaf className="w-32 h-32 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
                    <Leaf className="w-5 h-5" /> Green Alternative Available
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-2">{report.greenAlternative.name}</h4>
                  <p className="text-stone-600 text-sm mb-4">Compare with top recommendation ({report.greenAlternative.compName}):</p>
                  
                  <div className="flex gap-4">
                    <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
                      Sustainability: {report.greenAlternative.sustGain}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                      Cost: {report.greenAlternative.costDiff}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-stone-600 border-stone-200">
                      Shelf Life: {report.greenAlternative.shelfLifeDiff}
                    </Badge>
                  </div>
                </Card>
              </RevealOnScroll>
            )}
          </section>

          {/* Section: Insights & Risks */}
          <section id="insights" className="scroll-mt-28">
            <h3 className="text-2xl font-bold text-stone-900 mb-6">AI Insights & Risks</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {report.risks.map((risk: any, i: number) => (
                <RevealOnScroll key={i} delay={i * 0.1}>
                  <Card className={cn(
                    "p-5 border-l-4",
                    risk.level === 'warning' ? "border-l-amber-500 bg-amber-50" : "border-l-blue-500 bg-blue-50"
                  )}>
                    <div className="flex gap-3">
                      {risk.level === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" /> : <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                      <p className={cn("text-sm font-medium", risk.level === 'warning' ? "text-amber-900" : "text-blue-900")}>
                        {risk.message}
                      </p>
                    </div>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>

            <Card className="p-6">
              <h4 className="font-semibold text-stone-800 mb-6">Feature Contributions to Recommendation</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.features} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#57534E' }} width={120} />
                    <RechartsTooltip cursor={{ fill: '#F5F5F4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {report.features.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#A8A29E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          {/* Footer Actions / Next Steps */}
          <section className="pt-8 border-t border-stone-200">
            <h3 className="text-xl font-bold text-stone-900 mb-4">What to do next</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-xl">
                Find Suppliers <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="flex-1 py-6 text-lg rounded-xl border-2 border-stone-200 hover:bg-stone-50">
                Adjust Parameters
              </Button>
            </div>
            <p className="text-center text-xs text-stone-400 mt-8 max-w-2xl mx-auto">
              Disclaimer: This AI-generated report provides decision support based on computational models and input data. It does not replace physical testing or regulatory compliance checks. Always validate with your packaging supplier.
            </p>
          </section>

        </div>
      </div>

      {/* Mobile Actions Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 flex justify-around xl:hidden z-50">
        <button className="flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-600">
          <Download className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Save PDF</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-600">
          <BookmarkPlus className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Save</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-600">
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Share</span>
        </button>
      </div>

    </div>
  );
}

// Inline Tooltip component for this file
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs bg-stone-900 text-white text-xs rounded p-2 z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
      </div>
    </div>
  );
};
