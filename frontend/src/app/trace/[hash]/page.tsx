'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, Clock, AlertTriangle, ShieldCheck, Thermometer, Droplets, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TraceScanPage({ params }: { params: { hash: string } }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/trace/${params.hash}`)
      .then(res => {
        if (!res.ok) throw new Error('Trace not found');
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, [params.hash]);

  if (error) {
    return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  }

  if (!data) {
    return <div className="p-8 text-center">Loading Trace Info...</div>;
  }

  const freshnessPercent = data.freshness_pct || 0;
  
  let freshnessColor = "text-emerald-500";
  let ringColor = "stroke-emerald-500";
  let statusText = "Fresh & Optimal";
  
  if (freshnessPercent <= 25) {
    freshnessColor = "text-red-500";
    ringColor = "stroke-red-500";
    statusText = "Consume Soon";
  } else if (freshnessPercent <= 60) {
    freshnessColor = "text-amber-500";
    ringColor = "stroke-amber-500";
    statusText = "Good Condition";
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (freshnessPercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 sm:p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen sm:min-h-0 sm:rounded-3xl sm:shadow-xl overflow-hidden relative">
        
        {/* Header Image Area */}
        <div className="h-48 bg-emerald-700 relative flex flex-col justify-between p-6 overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md">DEMO DATA</Badge>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-10 -right-10 text-emerald-600/30 w-64 h-64"
          >
            <ShieldCheck className="w-full h-full" />
          </motion.div>

          <div className="mt-auto relative z-10 text-white">
            <h1 className="text-2xl font-bold leading-tight">{data.product_info?.commodity_name}</h1>
            <p className="opacity-90 mt-1">{data.producer_name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Freshness Ring */}
          <div className="flex items-center justify-center -mt-16 relative z-20">
            <div className="bg-white dark:bg-gray-900 rounded-full p-2 shadow-lg">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} className="stroke-gray-200 dark:stroke-gray-800" strokeWidth="8" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r={radius} 
                    className={`${ringColor} transition-all duration-1000 ease-out`} 
                    strokeWidth="8" fill="none" 
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-2xl font-bold font-mono ${freshnessColor}`}>{data.days_remaining}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Days Left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Badge variant="outline" className={`text-sm px-4 py-1.5 ${freshnessColor} border-current`}>
              {statusText}
            </Badge>
          </div>

          {/* Timeline */}
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
            {[
              { label: 'Produced', date: data.packaging_date, icon: <Package className="w-4 h-4" />, done: true },
              { label: 'Packaged', date: data.packaging_date, icon: <ShieldCheck className="w-4 h-4" />, done: true, highlight: true },
              { label: 'Estimated Expiry', date: data.expiry_date, icon: <AlertTriangle className="w-4 h-4" />, done: false }
            ].map((step, i) => (
              <div key={i} className={`relative ${step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center text-white
                  ${step.highlight ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/30' : 
                    step.done ? 'bg-gray-400' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {step.icon}
                </div>
                <div className="font-semibold">{step.label}</div>
                <div className="text-sm font-mono mt-0.5">{step.date}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-none shadow-none">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-1">Batch Number</div>
                <div className="font-mono text-sm font-semibold truncate">{data.batch_number}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-none shadow-none">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <div className="text-sm font-semibold">{data.product_info?.category}</div>
              </CardContent>
            </Card>
          </div>

          {/* Packaging Specs */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Packaging Specifications
            </h3>
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-b border-gray-200 dark:border-gray-800">
                <p className="font-medium text-emerald-800 dark:text-emerald-400">{data.product_info?.packaging_material}</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
                <div className="p-3 text-center">
                  <Thermometer className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                  <div className="text-[10px] text-gray-500">Barrier</div>
                  <div className="font-mono font-medium text-xs">{data.product_info?.barrier_class || 'Standard'}</div>
                </div>
                <div className="p-3 text-center">
                  <Droplets className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                  <div className="text-[10px] text-gray-500">Eco Score</div>
                  <div className="font-mono font-medium text-xs">{data.product_info?.eco_score || 'A'}</div>
                </div>
                <div className="p-3 text-center">
                  <Package className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                  <div className="text-[10px] text-gray-500">Temp</div>
                  <div className="font-mono font-medium text-xs">{data.product_info?.storage_temp_c || 25}°C</div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
            <strong>Storage Instructions:</strong> Maintain temperature at {data.product_info?.storage_temp_c || 25}°C to maximize the {data.total_shelf_life_days} days shelf life.
          </div>

          <Button className="w-full h-12 text-lg rounded-xl" variant="outline">
            Scan Another Product
          </Button>
        </div>
      </div>
    </div>
  );
}
