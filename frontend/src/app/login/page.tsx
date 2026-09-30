'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackageSearch, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store';
import { fadeInUp } from '@/lib/motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state: any) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // using native state for simplicity if react-hook-form full setup isn't robustly assumed, 
  // but we will use the standard react-hook-form pattern with custom validation simulation.
  const [formData, setFormData] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error on type
    if (errors[e.target.name as keyof LoginFormValues]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
    setErrorMsg('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      loginSchema.parse(formData);
      
      // Mock login for hackathon demo
      setTimeout(() => {
        const mockToken = "mock-jwt-token-12345";
        const mockUser = {
          id: 1,
          email: formData.email,
          full_name: "Demo User",
          role: "User",
        };
        
        login(mockToken, mockUser);
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrorMsg(error.message || 'An error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded bg-forest-600 flex items-center justify-center text-white shadow-lg shadow-forest-600/20">
              <PackageSearch size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-forest-900">PackLabs</span>
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeInUp}
        >
          <Card className="border-stone-200 shadow-xl shadow-stone-200/50">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-stone-900">Welcome back</CardTitle>
              <CardDescription className="text-center text-stone-500">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700" htmlFor="email">Email</label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-stone-700" htmlFor="password">Password</label>
                    <Link href="#" className="text-xs font-medium text-forest-600 hover:text-forest-700">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log in'}
                </Button>
              </form>

                <div className="mt-6">
                </div>
              </CardContent>
            <CardFooter className="flex justify-center border-t border-stone-100 pt-6">
              <p className="text-sm text-stone-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-forest-600 hover:text-forest-700">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
