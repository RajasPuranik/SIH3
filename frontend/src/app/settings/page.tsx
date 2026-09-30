'use client';

import React from 'react';
import { User, Palette, Globe, Type, Eye, Save, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and app settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="hidden md:flex flex-col space-y-2 sticky top-24">
          <Button variant="secondary" className="justify-start w-full font-medium">Profile</Button>
          <Button variant="ghost" className="justify-start w-full text-gray-500">Appearance</Button>
          <Button variant="ghost" className="justify-start w-full text-gray-500">Accessibility</Button>
          <Button variant="ghost" className="justify-start w-full text-gray-500">Data & Storage</Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue="User" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input defaultValue="admin@packsmart.ai" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <div><Badge variant="secondary">Administrator</Badge></div>
              </div>
              <Button className="mt-2"><Save className="w-4 h-4 mr-2" /> Save Profile</Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</CardTitle>
              <CardDescription>Customize how PackSmart AI looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border-2 border-emerald-500 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer bg-emerald-50 dark:bg-emerald-900/10">
                    <Monitor className="w-6 h-6 text-emerald-600" />
                    <span className="text-sm font-medium">System</span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Sun className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium">Light</span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Moon className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4" /> Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Type className="w-4 h-4" /> Units</label>
                  <Select defaultValue="metric">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (°C, g, m²)</SelectItem>
                      <SelectItem value="imperial">Imperial (°F, oz, ft²)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Reduce Animations</h4>
                  <p className="text-xs text-gray-500">Minimize motion effects throughout the app</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">High Contrast Charts</h4>
                  <p className="text-xs text-gray-500">Use patterns and higher contrast colors in data visualizations</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Data */}
          <Card className="border-red-100 dark:border-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Clear Local History</h4>
                  <p className="text-xs text-gray-500">Remove all locally saved analyses and comparisons</p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
