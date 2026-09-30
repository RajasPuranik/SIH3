'use client';

import React, { useState } from 'react';
import { Search, Grid, List, Check, BarChart2, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MATERIALS = [
  { id: '1', name: 'LDPE', category: 'Low Cost', otr: 5000, wvtr: 1.5, cost: 0.2, recyclability: 80, carbon: 2.5, eco: 40 },
  { id: '2', name: 'HDPE', category: 'Low Cost', otr: 2000, wvtr: 0.5, cost: 0.25, recyclability: 90, carbon: 2.3, eco: 50 },
  { id: '3', name: 'PET', category: 'High Barrier', otr: 50, wvtr: 2.0, cost: 0.4, recyclability: 95, carbon: 3.0, eco: 60 },
  { id: '4', name: 'PP', category: 'Low Cost', otr: 1500, wvtr: 0.5, cost: 0.3, recyclability: 85, carbon: 2.4, eco: 45 },
  { id: '5', name: 'PLA', category: 'Biodegradable', otr: 1000, wvtr: 150, cost: 0.8, recyclability: 20, carbon: 1.2, eco: 90 },
  { id: '6', name: 'PHA', category: 'Biodegradable', otr: 800, wvtr: 100, cost: 1.2, recyclability: 25, carbon: 1.0, eco: 95 },
  { id: '7', name: 'EVOH', category: 'High Barrier', otr: 0.5, wvtr: 50, cost: 1.5, recyclability: 10, carbon: 4.5, eco: 30 },
  { id: '8', name: 'Nylon (PA)', category: 'High Barrier', otr: 40, wvtr: 15, cost: 1.1, recyclability: 15, carbon: 5.0, eco: 20 },
  { id: '9', name: 'Kraft Paper', category: 'Paper-based', otr: 10000, wvtr: 1000, cost: 0.15, recyclability: 100, carbon: 0.8, eco: 85 },
  { id: '10', name: 'Aluminum Foil', category: 'High Barrier', otr: 0, wvtr: 0, cost: 2.0, recyclability: 70, carbon: 8.0, eco: 35 },
  { id: '11', name: 'Metallized PET', category: 'High Barrier', otr: 1, wvtr: 0.1, cost: 0.6, recyclability: 10, carbon: 3.5, eco: 25 },
  { id: '12', name: 'PVC', category: 'Low Cost', otr: 150, wvtr: 3.0, cost: 0.35, recyclability: 5, carbon: 4.0, eco: 10 },
  { id: '13', name: 'BOPP', category: 'Low Cost', otr: 1000, wvtr: 0.3, cost: 0.35, recyclability: 80, carbon: 2.4, eco: 45 },
  { id: '14', name: 'Cellulose Film', category: 'Biodegradable', otr: 20, wvtr: 200, cost: 0.9, recyclability: 60, carbon: 1.5, eco: 80 },
  { id: '15', name: 'Paper/PE Laminate', category: 'Paper-based', otr: 1000, wvtr: 5, cost: 0.4, recyclability: 30, carbon: 2.0, eco: 50 },
  { id: '16', name: 'Paper/Foil Laminate', category: 'Paper-based', otr: 5, wvtr: 0.5, cost: 0.7, recyclability: 10, carbon: 4.0, eco: 30 },
  { id: '17', name: 'PBS', category: 'Biodegradable', otr: 900, wvtr: 120, cost: 1.0, recyclability: 20, carbon: 1.3, eco: 88 },
  { id: '18', name: 'PBAT', category: 'Biodegradable', otr: 1500, wvtr: 180, cost: 1.1, recyclability: 20, carbon: 1.4, eco: 85 },
  { id: '19', name: 'Glassine', category: 'Paper-based', otr: 8000, wvtr: 800, cost: 0.2, recyclability: 95, carbon: 0.9, eco: 80 },
  { id: '20', name: 'Molded Pulp', category: 'Paper-based', otr: 15000, wvtr: 1500, cost: 0.1, recyclability: 100, carbon: 0.5, eco: 98 },
];

const FILTERS = ['All', 'Biodegradable', 'High Barrier', 'Low Cost', 'Paper-based'];

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [compareList, setCompareList] = useState<typeof MATERIALS>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredMaterials = MATERIALS.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || m.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCompareToggle = (material: typeof MATERIALS[0]) => {
    if (compareList.find(c => c.id === material.id)) {
      setCompareList(compareList.filter(c => c.id !== material.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, material]);
    }
  };

  const radarData = compareList.length > 0 ? [
    { subject: 'OTR', ...Object.fromEntries(compareList.map(m => [m.name, 100 - Math.min(100, m.otr / 50)])) },
    { subject: 'WVTR', ...Object.fromEntries(compareList.map(m => [m.name, 100 - Math.min(100, m.wvtr / 2)])) },
    { subject: 'Recyclability', ...Object.fromEntries(compareList.map(m => [m.name, m.recyclability])) },
    { subject: 'Eco Score', ...Object.fromEntries(compareList.map(m => [m.name, m.eco])) },
    { subject: 'Cost Efficiency', ...Object.fromEntries(compareList.map(m => [m.name, 100 - Math.min(100, m.cost * 50)])) },
  ] : [];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Material Catalog</h1>
          <p className="text-gray-500 dark:text-gray-400">Explore and compare packaging materials</p>
        </div>
        
        <div className="flex items-center gap-2">
          {compareList.length > 0 && (
            <Button 
              variant="default" 
              onClick={() => setShowCompare(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Compare ({compareList.length})
            </Button>
          )}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search materials..." 
            className="pl-10 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
          {FILTERS.map(filter => (
            <Badge 
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap text-sm px-4 py-2"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMaterials.map(material => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={material.id}
              >
                <Card 
                  className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${expandedId === material.id ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{material.name}</CardTitle>
                      <input 
                        type="checkbox"
                        checked={!!compareList.find(c => c.id === material.id)}
                        onChange={() => handleCompareToggle(material)}
                        disabled={compareList.length >= 3 && !compareList.find(c => c.id === material.id)}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                        title="Add to comparison"
                      />
                    </div>
                    <Badge variant="secondary" className="w-fit">{material.category}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4" onClick={() => setExpandedId(expandedId === material.id ? null : material.id)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">OTR (cc/m²/day)</p>
                        <p className="font-mono text-sm font-semibold">{material.otr}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">WVTR (g/m²/day)</p>
                        <p className="font-mono text-sm font-semibold">{material.wvtr}</p>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedId === material.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-4 border-t space-y-3"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Cost</span>
                            <span className="font-mono font-medium">${material.cost}/m²</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Recyclability</span>
                            <span className="font-mono font-medium text-emerald-600">{material.recyclability}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Carbon FP</span>
                            <span className="font-mono font-medium text-amber-600">{material.carbon} kg CO₂</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-4 font-semibold">Compare</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">OTR <span className="text-xs font-normal text-gray-500">(cc)</span></th>
                <th className="p-4 font-semibold">WVTR <span className="text-xs font-normal text-gray-500">(g)</span></th>
                <th className="p-4 font-semibold">Cost <span className="text-xs font-normal text-gray-500">($/m²)</span></th>
                <th className="p-4 font-semibold">Recyclable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredMaterials.map(material => (
                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <input 
                      type="checkbox"
                      checked={!!compareList.find(c => c.id === material.id)}
                      onChange={() => handleCompareToggle(material)}
                      disabled={compareList.length >= 3 && !compareList.find(c => c.id === material.id)}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                    />
                  </td>
                  <td className="p-4 font-medium">{material.name}</td>
                  <td className="p-4"><Badge variant="outline">{material.category}</Badge></td>
                  <td className="p-4 font-mono">{material.otr}</td>
                  <td className="p-4 font-mono">{material.wvtr}</td>
                  <td className="p-4 font-mono">${material.cost}</td>
                  <td className="p-4 font-mono">{material.recyclability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showCompare && compareList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Compare Materials</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCompare(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="h-[300px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" textAnchor="middle" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <RechartsTooltip />
                    {compareList.map((m, i) => (
                      <Radar 
                        key={m.id} 
                        name={m.name} 
                        dataKey={m.name} 
                        stroke={['#10B981', '#F59E0B', '#3B82F6'][i]} 
                        fill={['#10B981', '#F59E0B', '#3B82F6'][i]} 
                        fillOpacity={0.3} 
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {compareList.map((m, i) => (
                  <Card key={m.id} className="border-l-4" style={{ borderLeftColor: ['#10B981', '#F59E0B', '#3B82F6'][i] }}>
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">{m.name}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCompareToggle(m)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Cost:</span><span className="font-mono">${m.cost}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Recycle:</span><span className="font-mono">{m.recyclability}%</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
