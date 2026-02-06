import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Theme = 'light' | 'dark';
type ColorScheme = 'default' | 'green' | 'african';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('urbansoko-theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  }
  return getSystemTheme();
};

const getInitialColorScheme = (): ColorScheme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('urbansoko-colorScheme');
    if (saved === 'default' || saved === 'green' || saved === 'african') {
      return saved;
    }
  }
  return 'default';
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialColorScheme);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
  };

  // Apply theme classes and persist - single effect for all theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('urbansoko-theme', theme);
    localStorage.setItem('urbansoko-colorScheme', colorScheme);
    
    const root = document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('dark', 'theme-green', 'theme-african', 'sunlight-mode');
    
    // Apply dark mode
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Apply color scheme
    if (colorScheme === 'green') {
      root.classList.add('theme-green');
    } else if (colorScheme === 'african') {
      root.classList.add('theme-african');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0d14' : '#f8f9fb');
    }
  }, [theme, colorScheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a theme
      const savedTheme = localStorage.getItem('urbansoko-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      colorScheme,
      toggleTheme,
      setColorScheme,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
