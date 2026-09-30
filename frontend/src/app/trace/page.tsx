'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Plus, History, Package, Clock, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MOCK_BATCHES = [
  { id: '1', hash: 'abc123xyz', producer: 'Fresh Farms Inc', batchNo: 'B-2023-10-01', date: '2023-10-01', freshness: 85 },
  { id: '2', hash: 'def456uvw', producer: 'Dairy Best', batchNo: 'M-492-X', date: '2023-09-15', freshness: 40 },
  { id: '3', hash: 'ghi789rst', producer: 'Green Leaf Co', batchNo: 'GL-992', date: '2023-08-01', freshness: 10 },
];

export default function TraceabilityPage() {
  const [producer, setProducer] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [analysisId, setAnalysisId] = useState('');
  const [labelSize, setLabelSize] = useState('40mm');
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producer || !batchNo || !analysisId) {
      setErrorMsg("Please fill in all required fields including Analysis ID.");
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/trace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_id: analysisId,
          producer_name: producer,
          batch_number: batchNo,
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create trace');
      }
      setGeneratedHash(data.hash);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Traceability Manager</h1>
        <p className="text-gray-500 dark:text-gray-400">Generate Digital Product Passports and manage QR codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                New Trace Batch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link to Analysis ID *</label>
                  <Input 
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" 
                    required
                    value={analysisId}
                    onChange={(e) => setAnalysisId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Producer Name *</label>
                  <Input 
                    required 
                    placeholder="Company Name" 
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch Number *</label>
                  <Input 
                    required 
                    placeholder="e.g. BATCH-001" 
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}
                <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {isLoading ? 'Generating...' : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate Passport
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {generatedHash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between">
                    Generated Passport
                    <Badge variant="outline" className="font-mono text-xs">{generatedHash}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <QRCodeSVG 
                      value={`https://packsmart.ai/trace/${generatedHash}`} 
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="w-full space-y-2">
                    <label className="text-xs text-gray-500">Label Size</label>
                    <Select value={labelSize} onValueChange={setLabelSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25mm">25x25 mm (Compact)</SelectItem>
                        <SelectItem value="40mm">40x40 mm (Standard)</SelectItem>
                        <SelectItem value="A6">A6 (Pallet Label)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Labels
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Batches
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_BATCHES.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 flex gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shrink-0 flex items-center justify-center">
                      <QRCodeSVG value={`https://packsmart.ai/trace/${batch.hash}`} size={64} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={batch.producer}>
                          {batch.producer}
                        </h3>
                        <Badge 
                          className={
                            batch.freshness > 60 ? 'bg-emerald-100 text-emerald-800' : 
                            batch.freshness > 25 ? 'bg-amber-100 text-amber-800' : 
                            'bg-red-100 text-red-800'
                          }
                          variant="outline"
                        >
                          {batch.freshness}% Fresh
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Package className="w-3 h-3 mr-1" />
                        <span className="font-mono">{batch.batchNo}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(batch.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
