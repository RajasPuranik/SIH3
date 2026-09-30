'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Check, X, ArrowRight, Save, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_ANALYSES = [
  { id: '1', name: 'Standard LDPE vs Coffee', material: 'LDPE', shelfLife: 45, eco: 40, cost: 0.2, otr: 5000, wvtr: 1.5 },
  { id: '2', name: 'High Barrier PET for Coffee', material: 'PET', shelfLife: 180, eco: 60, cost: 0.4, otr: 50, wvtr: 2.0 },
  { id: '3', name: 'Eco-friendly PLA Option', material: 'PLA', shelfLife: 30, eco: 90, cost: 0.8, otr: 1000, wvtr: 150 },
];

export default function ComparePage() {
  const [leftId, setLeftId] = useState('1');
  const [rightId, setRightId] = useState('2');

  const leftData = MOCK_ANALYSES.find(a => a.id === leftId);
  const rightData = MOCK_ANALYSES.find(a => a.id === rightId);

  const getDiffColor = (left: number, right: number, isHigherBetter: boolean) => {
    if (left === right) return 'text-gray-500';
    const isRightBetter = isHigherBetter ? right > left : right < left;
    return isRightBetter ? 'text-emerald-500' : 'text-red-500';
  };

  const getDiffIcon = (left: number, right: number, isHigherBetter: boolean) => {
    if (left === right) return null;
    const isRightBetter = isHigherBetter ? right > left : right < left;
    return isRightBetter ? <Check className="w-4 h-4 inline ml-1 text-emerald-500" /> : <X className="w-4 h-4 inline ml-1 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compare Scenarios</h1>
          <p className="text-gray-500 dark:text-gray-400">Evaluate different materials side-by-side</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700"><Save className="w-4 h-4 mr-2" /> Save Comparison</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        
        {/* Left Side */}
        <div className="space-y-4">
          <Select value={leftId} onValueChange={setLeftId}>
            <SelectTrigger className="w-full text-lg h-12 bg-white dark:bg-gray-900">
              <SelectValue placeholder="Select analysis..." />
            </SelectTrigger>
            <SelectContent>
              {MOCK_ANALYSES.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {leftData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={leftId}>
              <Card className="border-t-4 border-t-gray-400">
                <CardHeader>
                  <CardTitle className="text-xl">{leftData.material}</CardTitle>
                  <Badge variant="secondary">Baseline</Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Estimated Shelf Life</div>
                    <div className="text-4xl font-bold font-mono">{leftData.shelfLife} <span className="text-lg font-normal text-gray-500">days</span></div>
                  </div>
                  
                  <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Eco Score</span>
                      <span className="font-mono font-semibold">{leftData.eco}/100</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Cost per m²</span>
                      <span className="font-mono font-semibold">${leftData.cost}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">OTR</span>
                      <span className="font-mono font-semibold">{leftData.otr}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">WVTR</span>
                      <span className="font-mono font-semibold">{leftData.wvtr}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* VS Divider */}
        <div className="hidden md:flex flex-col items-center justify-center pt-20">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
            <ArrowLeftRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-4">
          <Select value={rightId} onValueChange={setRightId}>
            <SelectTrigger className="w-full text-lg h-12 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200">
              <SelectValue placeholder="Select analysis..." />
            </SelectTrigger>
            <SelectContent>
              {MOCK_ANALYSES.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {rightData && leftData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={rightId}>
              <Card className="border-t-4 border-t-emerald-500 shadow-emerald-500/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{rightData.material}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Alternative</Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl relative overflow-hidden">
                    <div className="text-sm text-emerald-700 dark:text-emerald-400 mb-1">Estimated Shelf Life</div>
                    <div className="text-4xl font-bold font-mono flex items-center justify-center gap-2">
                      {rightData.shelfLife} 
                      <span className="text-lg font-normal opacity-70">days</span>
                      <span className={`text-base ${getDiffColor(leftData.shelfLife, rightData.shelfLife, true)} flex items-center`}>
                        ({rightData.shelfLife > leftData.shelfLife ? '+' : ''}{rightData.shelfLife - leftData.shelfLife})
                        {getDiffIcon(leftData.shelfLife, rightData.shelfLife, true)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500">Eco Score</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{rightData.eco}/100</span>
                        <span className={`font-mono text-sm w-12 text-right ${getDiffColor(leftData.eco, rightData.eco, true)}`}>
                          {rightData.eco - leftData.eco > 0 ? '+' : ''}{rightData.eco - leftData.eco}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500">Cost per m²</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">${rightData.cost}</span>
                        <span className={`font-mono text-sm w-12 text-right ${getDiffColor(leftData.cost, rightData.cost, false)}`}>
                          {rightData.cost - leftData.cost > 0 ? '+' : ''}{(rightData.cost - leftData.cost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500">OTR</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{rightData.otr}</span>
                        <span className={`font-mono text-sm w-12 text-right ${getDiffColor(leftData.otr, rightData.otr, false)}`}>
                          {rightData.otr < leftData.otr ? 'Better' : 'Worse'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500">WVTR</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{rightData.wvtr}</span>
                        <span className={`font-mono text-sm w-12 text-right ${getDiffColor(leftData.wvtr, rightData.wvtr, false)}`}>
                          {rightData.wvtr < leftData.wvtr ? 'Better' : 'Worse'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
