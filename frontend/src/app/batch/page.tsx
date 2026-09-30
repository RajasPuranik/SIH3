'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileDown, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BatchAnalysisPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    }
  }, []);

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Set mock results
          setResults([
            { id: 1, product: 'Roasted Peanuts', currentMat: 'LDPE', recommended: 'BOPP', shelfLifeInc: '+45 days', status: 'success' },
            { id: 2, product: 'Fresh Spinach', currentMat: 'PVC', recommended: 'PLA', shelfLifeInc: '+2 days', status: 'success' },
            { id: 3, product: 'Missing Data Item', currentMat: 'Unknown', recommended: 'N/A', shelfLifeInc: 'N/A', status: 'error', error: 'Missing moisture content' },
          ]);
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Batch Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload multiple products for AI-powered packaging recommendations</p>
        </div>
        <Button variant="outline">
          <FileDown className="w-4 h-4 mr-2" />
          Download CSV Template
        </Button>
      </div>

      {!results.length ? (
        <Card className={`border-2 border-dashed transition-all duration-200 ${isDragging ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 scale-[1.02]' : 'border-gray-300 dark:border-gray-700'}`}>
          <CardContent 
            className="flex flex-col items-center justify-center py-20"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <motion.div 
              animate={{ y: isDragging ? -10 : 0 }}
              className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-6"
            >
              <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            
            <h3 className="text-xl font-semibold mb-2">
              {isDragging ? 'Drop CSV here' : 'Drag & drop your CSV file here'}
            </h3>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
              Upload a spreadsheet containing product properties, current packaging, and target requirements.
            </p>
            
            {!file ? (
              <div className="relative">
                <Button variant="outline" className="relative z-10">Browse Files</Button>
                <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            ) : (
              <div className="flex flex-col items-center w-full max-w-md space-y-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg w-full border border-gray-200 dark:border-gray-700">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="w-4 h-4" /></Button>
                </div>
                
                {isProcessing ? (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing {file.name}...</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleProcess}>
                    Analyze Batch Data
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Analysis Complete</h3>
                <p className="text-sm text-gray-500">Processed 3 rows successfully.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setResults([]); setFile(null); }}>Upload Another</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700"><FileDown className="w-4 h-4 mr-2" /> Export Results</Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Current Material</th>
                  <th className="p-4 font-semibold">Recommended</th>
                  <th className="p-4 font-semibold">Expected Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {results.map((row) => (
                  <tr key={row.id} className={row.status === 'error' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                    <td className="p-4">
                      {row.status === 'success' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Success</Badge>
                      ) : (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</Badge>
                      )}
                    </td>
                    <td className="p-4 font-medium">{row.product}</td>
                    <td className="p-4 text-gray-500">{row.currentMat}</td>
                    <td className="p-4">
                      {row.status === 'success' ? (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{row.recommended}</span>
                      ) : (
                        <span className="text-red-500 text-xs">{row.error}</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-emerald-600">{row.shelfLifeInc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Ensure X is available above by adding it to imports
import { X } from 'lucide-react';
