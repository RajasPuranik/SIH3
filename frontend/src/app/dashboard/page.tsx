'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PackageSearch, 
  FileText, 
  Leaf, 
  QrCode, 
  PlusCircle,
  Database,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedNumber } from '@/components/animated/animated-number';
import { useAuthStore } from '@/lib/store';
import { staggerContainer, fadeInUp } from '@/lib/motion';

const recentAnalyses = [
  { id: '1', product: 'Fresh Strawberries', date: 'Oct 24, 2023', status: 'Completed', score: 'A+' },
  { id: '2', product: 'Organic Turmeric', date: 'Oct 21, 2023', status: 'Completed', score: 'B' },
  { id: '3', product: 'Potato Chips', date: 'Oct 15, 2023', status: 'Draft', score: '-' },
];

export default function DashboardPage() {
  const user = useAuthStore((state: any) => state.user);
  
  const userName = user?.name || 'Guest User';

  return (
    <div className="min-h-screen bg-stone-50/50 p-6 lg:p-8 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Welcome back, {userName}</h1>
            <p className="text-stone-500 mt-1">Here's an overview of your packaging activities.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white border-stone-200">
              <Database className="w-4 h-4 mr-2" /> Browse Materials
            </Button>
            <Button className="bg-forest-600 hover:bg-forest-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" /> New Analysis
            </Button>
          </div>
        </div>

        <motion.div 
          variants={staggerContainer()}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* KPI Cards */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-forest-50 text-forest-600 rounded-lg">
                    <PackageSearch className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500">Total Analyses</p>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1 flex items-center gap-1 font-mono">
                    <AnimatedNumber value={12} />
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Leaf className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500">Avg. Eco Score</p>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1 flex items-center gap-1 font-mono">
                    <AnimatedNumber value={85} />%
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500">Materials Explored</p>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1 flex items-center gap-1 font-mono">
                    <AnimatedNumber value={48} />
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500">Traced Batches</p>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1 flex items-center gap-1 font-mono">
                    <AnimatedNumber value={5} />
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-stone-100 pb-4">
                <CardTitle className="text-lg font-semibold text-stone-900">Recent Analyses</CardTitle>
                <Link href="/analyses" className="text-sm text-forest-600 hover:text-forest-700 font-medium flex items-center">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentAnalyses.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {recentAnalyses.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-stone-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-stone-900">{item.product}</h4>
                            <p className="text-sm text-stone-500">{item.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} 
                            className={item.status === 'Completed' ? 'bg-forest-100 text-forest-700 hover:bg-forest-200 border-none' : ''}>
                            {item.status}
                          </Badge>
                          <div className="text-sm font-medium text-stone-900 w-12 text-right">
                            {item.score}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-900 mb-1">No analyses yet</h3>
                    <p className="text-stone-500 mb-6 max-w-sm">Start your first packaging analysis to get AI-powered recommendations.</p>
                    <Button className="bg-forest-600 hover:bg-forest-700 text-white">
                      <PlusCircle className="w-4 h-4 mr-2" /> Start Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-forest-900 text-white border-none shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-forest-800 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sustainability Tip</h3>
                <p className="text-forest-200 text-sm leading-relaxed mb-4">
                  Switching from traditional PET to PLA can reduce carbon footprint by up to 60%, though it requires industrial composting facilities.
                </p>
                <Button variant="link" className="text-amber-400 hover:text-amber-300 p-0 h-auto font-medium">
                  Read more about bio-plastics <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
