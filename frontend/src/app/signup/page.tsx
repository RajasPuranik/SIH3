'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { PackageSearch, Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store';
import { fadeInUp } from '@/lib/motion';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Farmer', 'Startup', 'Industry', 'Researcher'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state: any) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<SignupFormValues>({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Startup' 
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormValues, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof SignupFormValues]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
    setErrorMsg('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      signupSchema.parse(formData);
      
      // Mock signup for hackathon demo
      setTimeout(() => {
        const mockToken = "mock-jwt-token-12345";
        const mockUser = {
          id: Math.floor(Math.random() * 1000) + 1,
          email: formData.email,
          full_name: formData.name,
          role: formData.role,
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
        setErrorMsg(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded bg-forest-600 flex items-center justify-center text-white shadow-lg shadow-forest-600/20">
              <PackageSearch size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-forest-900">PackLabs</span>
          </Link>
        </div>

        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <Card className="border-stone-200 shadow-xl shadow-stone-200/50">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-stone-900">Create an account</CardTitle>
              <CardDescription className="text-center text-stone-500">
                Join thousands optimizing their food packaging
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
                  <label className="text-sm font-medium text-stone-700" htmlFor="name">Full Name</label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700" htmlFor="email">Email</label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700" htmlFor="password">Password</label>
                  <div className="relative">
                    <Input 
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700" htmlFor="role">I am a...</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Farmer">Farmer / Producer</option>
                    <option value="Startup">Food Startup</option>
                    <option value="Industry">Large Scale Industry</option>
                    <option value="Researcher">Researcher / Academic</option>
                  </select>
                  {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-stone-100 pt-6">
              <p className="text-sm text-stone-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-forest-600 hover:text-forest-700">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
