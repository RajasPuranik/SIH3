'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  PackageSearch,
  Database,
  LineChart,
  QrCode,
  Leaf,
  DollarSign,
  Apple,
  Info,
  ChevronRight,
  Globe,
  Sprout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedNumber } from '@/components/animated/animated-number';
import { RevealOnScroll } from '@/components/animated/reveal-on-scroll';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer, duration, easing } from '@/lib/motion';

const audiences = ['Farmers', 'Startups', 'Industries', 'Researchers'];

const features = [
  {
    title: 'Smart Recommendations',
    description: 'AI-driven packaging suggestions tailored to specific food properties and environmental conditions.',
    icon: PackageSearch,
  },
  {
    title: 'Material Database',
    description: 'Extensive catalog of traditional and biodegradable packaging materials with detailed specs.',
    icon: Database,
  },
  {
    title: 'Shelf Life Prediction',
    description: 'Accurately estimate product shelf life based on material barrier properties and climate.',
    icon: LineChart,
  },
  {
    title: 'QR Traceability',
    description: 'Generate QR codes for batch tracking and sharing packaging details across the supply chain.',
    icon: QrCode,
  },
  {
    title: 'Sustainability Scoring',
    description: 'Evaluate the environmental impact of your packaging choices with our Eco-Score system.',
    icon: Leaf,
  },
  {
    title: 'Cost Optimization',
    description: 'Balance material performance with pricing to find the most cost-effective solutions.',
    icon: DollarSign,
  },
];

const steps = [
  {
    num: 1,
    title: 'Input',
    description: 'Enter food properties and environmental conditions.',
    icon: Apple,
  },
  {
    num: 2,
    title: 'Analyze',
    description: 'AI evaluates O2, moisture, and light barrier needs.',
    icon: Database,
  },
  {
    num: 3,
    title: 'Recommend',
    description: 'Get ranked optimal packaging material matches.',
    icon: PackageSearch,
  },
  {
    num: 4,
    title: 'Trace',
    description: 'Generate QR codes for transparent traceability.',
    icon: QrCode,
  },
];

const demos = [
  {
    title: 'Fresh Strawberries',
    subtitle: 'Export by Air',
    description: 'See how we pick breathable packaging for delicate produce to prevent mold and physical damage.',
    emoji: '🍓',
    category: 'Fresh Produce',
    params: { foodType: 'fresh_produce', shelfLife: 7, climate: 'refrigerated' },
  },
  {
    title: 'Potato Chips',
    subtitle: '6-month shelf life',
    description: 'High-barrier packaging recommendations for snack foods to prevent oxidation and moisture loss.',
    emoji: '🥔',
    category: 'Snacks',
    params: { foodType: 'snacks', shelfLife: 180, climate: 'ambient' },
  },
  {
    title: 'Turmeric Powder',
    subtitle: 'Monsoon Storage',
    description: 'Moisture protection strategies for spices stored in humid tropical climates.',
    emoji: '🌿',
    category: 'Spices',
    params: { foodType: 'spices', shelfLife: 365, climate: 'tropical' },
  },
];

export default function LandingPage() {
  const { language } = useTranslation();
  const [audienceIndex, setAudienceIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const pathLength = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAudienceIndex((prev) => (prev + 1) % audiences.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    setMousePosition({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  return (
    <div className="min-h-screen bg-background font-inter overflow-x-hidden text-foreground" onMouseMove={handleMouseMove}>
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-background to-forest-500/10 -z-10" />
          
          <div className="container mx-auto px-4 text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="inline-flex items-center rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-sm text-forest-700 mb-4">
                <SparklesIcon className="w-4 h-4 mr-2 text-amber-500" />
                <span>{language === 'hi' ? 'एआई-संचालित पैकेजिंग निर्णय v2.0' : 'AI-Powered Packaging Decisions v2.0'}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-forest-700 to-forest-500">
                  {language === 'hi' ? 'स्मार्ट पैकेजिंग' : 'Smart Packaging'}
                </span>
                {language === 'hi' ? 'सिफारिशें' : 'Recommendations'}
              </h1>
              
              <div className="text-2xl md:text-3xl font-medium text-muted-foreground h-10 flex items-center justify-center">
                <span>{language === 'hi' ? 'के लिए' : 'for'}&nbsp;</span>
                <div className="relative overflow-hidden h-10 w-48 text-left text-amber-600">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={audiences[audienceIndex]}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 font-semibold"
                    >
                      {language === 'hi' ? ['किसानों', 'स्टार्टअप्स', 'उद्योगों', 'शोधकर्ताओं'][audienceIndex] : audiences[audienceIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {language === 'hi' ? 'खाद्य शेल्फ जीवन को अनुकूलित करें, कचरे को कम करें, और हमारे उन्नत एआई इंजन के साथ स्थिरता में सुधार करें। अनुमान लगाना बंद करें और अपने उत्पादों की प्रभावी रूप से रक्षा करना शुरू करें।' : 'Optimize food shelf life, reduce waste, and improve sustainability with our advanced AI engine. Stop guessing and start protecting your products effectively.'}
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-forest-600 hover:bg-forest-700 text-white shadow-lg shadow-forest-600/20 w-full sm:w-auto group">
                  {language === 'hi' ? 'विश्लेषण शुरू करें' : 'Start Analysis'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-border text-foreground hover:bg-muted hover:text-foreground w-full sm:w-auto">
                  {language === 'hi' ? 'सामग्री का अन्वेषण करें' : 'Explore Materials'}
                </Button>
              </motion.div>
            </motion.div>

            {/* Floating Emojis (Desktop only) */}
            {!prefersReducedMotion && (
              <div className="hidden lg:block absolute inset-0 pointer-events-none -z-10">
                <motion.div animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }} className="absolute top-1/4 left-1/4 text-4xl opacity-50">🍓</motion.div>
                <motion.div animate={{ x: mousePosition.x * 1.5, y: mousePosition.y * 1.5 }} className="absolute top-1/3 right-1/4 text-5xl opacity-40">📦</motion.div>
                <motion.div animate={{ x: mousePosition.x * -2, y: mousePosition.y * 2 }} className="absolute bottom-1/3 left-1/3 text-3xl opacity-60">🌾</motion.div>
                <motion.div animate={{ x: mousePosition.x * 2, y: mousePosition.y * -1.5 }} className="absolute bottom-1/4 right-1/3 text-4xl opacity-50">♻️</motion.div>
              </div>
            )}
          </div>
          
          {/* Animated Stats Strip */}
          <div className="mt-20 border-y border-border bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-3xl md:text-4xl font-bold text-forest-700 flex items-center font-mono">
                    <AnimatedNumber value={50} />+
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Commodities</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-3xl md:text-4xl font-bold text-forest-700 flex items-center font-mono">
                    <AnimatedNumber value={30} />+
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Materials</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-3xl md:text-4xl font-bold text-forest-700 flex items-center font-mono">
                    <AnimatedNumber value={12} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Input Parameters</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-3xl md:text-4xl font-bold text-amber-600 flex items-center font-mono">
                    <AnimatedNumber value={3} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Layer AI Engine</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need for packaging decisions</h2>
              <p className="text-lg text-muted-foreground">Our comprehensive platform provides end-to-end support for selecting, validating, and tracing your food packaging solutions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <RevealOnScroll key={idx} delay={idx * 0.1}>
                  <Card className="h-full border border-border bg-background hover:bg-card hover:shadow-xl hover:shadow-forest-900/5 transition-all duration-300 group">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600 group-hover:scale-110 group-hover:bg-forest-600 group-hover:text-white transition-all duration-300">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-stone-900 text-stone-50 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How PackSmart AI works</h2>
              <p className="text-lg text-stone-400">A seamless workflow from data input to actionable packaging recommendations.</p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-stone-800">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-forest-500 origin-left"
                  style={{ scaleX: pathLength }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {steps.map((step, idx) => (
                  <RevealOnScroll key={idx} delay={idx * 0.2}>
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-24 h-24 rounded-full bg-stone-800 border-4 border-stone-900 shadow-xl flex items-center justify-center relative group">
                        <step.icon className="w-10 h-10 text-forest-400 group-hover:scale-110 group-hover:text-forest-300 transition-transform" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-foreground font-bold text-sm">
                          {step.num}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                        <p className="text-sm text-stone-400">{step.description}</p>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Demo Scenarios Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Try a demo scenario</h2>
                <p className="text-lg text-muted-foreground">Explore how our AI handles different commodities and supply chain challenges.</p>
              </div>
              <Button variant="ghost" className="hidden md:flex text-forest-600 hover:text-forest-700 hover:bg-forest-50">
                View all templates <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demos.map((demo, idx) => (
                <RevealOnScroll key={idx} delay={idx * 0.1}>
                  <Link href={`/analyze?template=${encodeURIComponent(demo.title)}`}>
                    <Card className="h-full border-border bg-card hover:border-forest-300 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col">
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-4xl bg-muted w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            {demo.emoji}
                          </div>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                            {demo.category}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{demo.title}</h3>
                        <p className="text-sm font-medium text-forest-600 mb-4">{demo.subtitle}</p>
                        <p className="text-muted-foreground text-sm mb-6 flex-grow">{demo.description}</p>
                        <div className="flex items-center text-sm font-semibold text-foreground group-hover:text-forest-600 mt-auto transition-colors">
                          Run analysis <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden bg-forest-900">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to optimize your packaging?</h2>
            <p className="text-xl text-forest-200 mb-10 max-w-2xl mx-auto">
              Join thousands of producers and manufacturers making data-driven packaging decisions today.
            </p>
            <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-amber-500 hover:bg-amber-600 text-foreground shadow-xl shadow-amber-500/20 group">
              Start Free Analysis
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-stone-800 pb-12">
            <div className="md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 rounded bg-forest-600 flex items-center justify-center">
                  <PackageSearch size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight">PackSmart AI</span>
              </Link>
              <p className="text-sm">Intelligent food packaging recommendations for a sustainable future.</p>
              <div className="flex items-center text-sm font-medium text-muted-foreground">
                <Globe className="w-4 h-4 mr-2" /> English
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Start Analysis</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Material Catalog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Methodology</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-sm">
            <p>&copy; {new Date().getFullYear()} PackSmart AI. All rights reserved.</p>
            <div className="flex items-center text-muted-foreground bg-stone-900 rounded-lg px-4 py-3 max-w-lg text-xs leading-relaxed">
              <Info className="w-4 h-4 mr-3 flex-shrink-0" />
              <p>Disclaimer: AI recommendations are for decision support and estimations only. Always validate material suitability with physical lab testing before mass production.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
