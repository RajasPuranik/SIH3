'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Beaker, LineChart, Database, Server, ShieldCheck, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:px-8 space-y-16 max-w-5xl py-12">
      
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl mb-4">
          <BrainCircuit className="w-16 h-16 text-emerald-600" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold tracking-tight">
          How <span className="text-emerald-600">PackSmart AI</span> Works
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Combining food science principles with machine learning to optimize packaging for shelf-life, sustainability, and cost.
        </motion.p>
      </section>

      {/* Methodology */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-center">Our 3-Layer Methodology</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-t-4 border-t-blue-500">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
                <Beaker className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">1. Expert Rules Engine</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We codified established food science principles to map product properties (moisture content, fat content, pH) to definitive barrier requirements (OTR, WVTR) and identify critical degradation pathways.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-t-4 border-t-purple-500">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">2. ML Prediction Models</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Using RandomForest and GradientBoosting algorithms trained on large datasets, we predict expected shelf-life outcomes for material-product combinations, accounting for non-linear interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-t-4 border-t-emerald-500">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
                <LineChart className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">3. Scoring Engine</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                A multi-criteria optimization system that weighs shelf-life performance against environmental impact (carbon footprint, recyclability) and economic factors based on user-defined priorities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Sources & Performance */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Database className="w-6 h-6 text-emerald-600" /> Data Infrastructure</h2>
          <div className="prose dark:prose-invert prose-emerald text-sm">
            <p>The system relies on three core proprietary databases:</p>
            <ul className="space-y-2">
              <li><strong>Material Database:</strong> Technical specifications of 50+ common packaging materials, including multi-layer laminates and emerging biodegradables.</li>
              <li><strong>Commodity Database:</strong> Baseline physicochemical properties of standard food commodities (e.g., roasted coffee beans vs. green coffee).</li>
              <li><strong>Sustainability Index:</strong> Life-cycle assessment (LCA) approximations for material production and end-of-life scenarios.</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="w-6 h-6 text-emerald-600" /> Model Performance</h2>
          <Card className="bg-gray-50 dark:bg-gray-900/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Shelf Life Prediction R²</div>
                  <div className="text-3xl font-mono font-bold text-emerald-600">0.92</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Material Rec Accuracy</div>
                  <div className="text-3xl font-mono font-bold text-emerald-600">89%</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500 mb-2">Training Data Status</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-50">15,000+ synthetic records</Badge>
                    <Badge variant="outline">Validated vs. Literature</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimers */}
      <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5" /> Limitations & Disclaimer
        </h2>
        <div className="text-amber-800/80 dark:text-amber-400/80 space-y-3 text-sm">
          <p>
            PackSmart AI is an advisory tool designed to narrow down packaging choices and accelerate R&D. It <strong>does not replace physical shelf-life testing</strong> or regulatory compliance checks.
          </p>
          <p>
            Predictions are based on idealized storage conditions and theoretical material properties. Actual performance may vary due to manufacturing variances, seal integrity, and supply chain temperature fluctuations. Always validate AI recommendations with physical prototype testing.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          View API Documentation
        </Button>
      </div>

    </div>
  );
}
