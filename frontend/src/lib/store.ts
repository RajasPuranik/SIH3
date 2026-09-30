import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User type (matches backend UserResponse schema)
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at?: string;
}

// --- Auth Store ---
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// --- Analysis Store ---
interface AnalysisState {
  currentInput: any;
  currentResult: any;
  history: any[];
  savedDrafts: any[];
  setCurrentInput: (input: any) => void;
  setCurrentResult: (result: any) => void;
  addToHistory: (item: any) => void;
  saveDraft: (draft: any) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentInput: null,
  currentResult: null,
  history: [],
  savedDrafts: [],
  setCurrentInput: (input) => set({ currentInput: input }),
  setCurrentResult: (result) => set({ currentResult: result }),
  addToHistory: (item) => set((state) => ({ history: [...state.history, item] })),
  saveDraft: (draft) => set((state) => ({ savedDrafts: [...state.savedDrafts, draft] })),
}));

// --- Settings Store ---
interface SettingsState {
  mode: 'simple' | 'expert';
  language: 'en' | 'hi';
  reduceMotion: boolean;
  theme: 'light' | 'dark' | 'system';
  setMode: (mode: 'simple' | 'expert') => void;
  setLanguage: (language: 'en' | 'hi') => void;
  setReduceMotion: (reduce: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: 'simple',
      language: 'en',
      reduceMotion: false,
      theme: 'system',
      setMode: (mode) => set({ mode }),
      setLanguage: (language) => set({ language }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// --- UI Store ---
interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  assistantOpen: boolean;
  notificationsOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setAssistantOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  assistantOpen: false,
  notificationsOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setAssistantOpen: (open) => set({ assistantOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}));
