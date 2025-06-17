import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean) => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: false,
      
      setTheme: (theme: Theme) => {
        let isDark = false;
        
        if (theme === 'dark') {
          isDark = true;
        } else if (theme === 'light') {
          isDark = false;
        } else {
          isDark = getSystemTheme();
        }
        
        applyTheme(isDark);
        set({ theme, isDark });
      },
      
      toggleTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          // If system, toggle to opposite of current system preference
          const systemIsDark = getSystemTheme();
          get().setTheme(systemIsDark ? 'light' : 'dark');
        } else {
          // Toggle between light and dark
          get().setTheme(theme === 'light' ? 'dark' : 'light');
        }
      },
      
      initializeTheme: () => {
        const { theme } = get();
        let isDark = false;
        
        if (theme === 'dark') {
          isDark = true;
        } else if (theme === 'light') {
          isDark = false;
        } else {
          isDark = getSystemTheme();
        }
        
        applyTheme(isDark);
        set({ isDark });
        
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = (e: MediaQueryListEvent) => {
            const { theme } = get();
            if (theme === 'system') {
              applyTheme(e.matches);
              set({ isDark: e.matches });
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          
          // Cleanup function
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  useThemeStore.getState().initializeTheme();
}
