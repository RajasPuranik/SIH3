"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.analyze': 'Analyze',
    'nav.catalog': 'Catalog',
    'nav.trace': 'Trace',
    'nav.more': 'More',
    // Terms
    'term.otr': 'Oxygen Transmission Rate (OTR)',
    'term.wvtr': 'Water Vapor Transmission Rate (WVTR)',
    'term.shelfLife': 'Shelf Life',
    'term.packaging': 'Packaging',
    'term.sustainability': 'Sustainability',
    'term.cost': 'Cost',
    'term.protection': 'Protection',
    // Actions
    'btn.login': 'Login',
    'btn.signup': 'Sign Up',
    'btn.save': 'Save',
    'btn.submit': 'Submit',
    'btn.cancel': 'Cancel',
    // Commodities
    'commodity.apple': 'Apple',
    'commodity.banana': 'Banana',
    'commodity.mango': 'Mango',
    'commodity.tomato': 'Tomato',
    'commodity.potato': 'Potato',
    'commodity.onion': 'Onion',
    'commodity.wheat': 'Wheat',
    'commodity.rice': 'Rice',
    'commodity.milk': 'Milk',
    'commodity.cheese': 'Cheese',
    'commodity.chicken': 'Chicken',
    'commodity.fish': 'Fish',
    'commodity.beef': 'Beef',
    'commodity.egg': 'Egg',
    'commodity.carrot': 'Carrot',
    'commodity.spinach': 'Spinach',
    'commodity.cabbage': 'Cabbage',
    'commodity.orange': 'Orange',
    'commodity.grape': 'Grape',
    'commodity.coffee': 'Coffee',
    // Messages
    'msg.error': 'An error occurred. Please try again.',
    'msg.success': 'Operation completed successfully.',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.analyze': 'विश्लेषण',
    'nav.catalog': 'कैटलॉग',
    'nav.trace': 'ट्रेस',
    'nav.more': 'अधिक',
    // Terms
    'term.otr': 'ऑक्सीजन संचरण दर (OTR)',
    'term.wvtr': 'जल वाष्प संचरण दर (WVTR)',
    'term.shelfLife': 'शेल्फ लाइफ',
    'term.packaging': 'पैकेजिंग',
    'term.sustainability': 'स्थिरता',
    'term.cost': 'लागत',
    'term.protection': 'सुरक्षा',
    // Actions
    'btn.login': 'लॉग इन करें',
    'btn.signup': 'साइन अप करें',
    'btn.save': 'सहेजें',
    'btn.submit': 'प्रस्तुत करें',
    'btn.cancel': 'रद्द करें',
    // Commodities
    'commodity.apple': 'सेब',
    'commodity.banana': 'केला',
    'commodity.mango': 'आम',
    'commodity.tomato': 'टमाटर',
    'commodity.potato': 'आलू',
    'commodity.onion': 'प्याज़',
    'commodity.wheat': 'गेहूं',
    'commodity.rice': 'चावल',
    'commodity.milk': 'दूध',
    'commodity.cheese': 'पनीर',
    'commodity.chicken': 'मुर्गी',
    'commodity.fish': 'मछली',
    'commodity.beef': 'गोमांस',
    'commodity.egg': 'अंडा',
    'commodity.carrot': 'गाजर',
    'commodity.spinach': 'पालक',
    'commodity.cabbage': 'पत्ता गोभी',
    'commodity.orange': 'संतरा',
    'commodity.grape': 'अंगूर',
    'commodity.coffee': 'कॉफ़ी',
    // Messages
    'msg.error': 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    'msg.success': 'ऑपरेशन सफलतापूर्वक पूरा हुआ।',
  },
};

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, initialLanguage = 'en' }: { children: ReactNode, initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
