import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdaptiveUIContextType {
  adaptiveEnabled: boolean;
  setAdaptiveEnabled: (enabled: boolean) => void;
  loading: boolean;
}

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (!context) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider');
  }
  return context;
};

interface AdaptiveUIProviderProps {
  children: ReactNode;
}

export const AdaptiveUIProvider = ({ children }: AdaptiveUIProviderProps) => {
  const [adaptiveEnabled, setAdaptiveEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdaptiveSetting();
  }, []);

  const fetchAdaptiveSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'adaptive_ui')
        .maybeSingle();

      if (error) {
        console.warn('Could not fetch adaptive UI setting:', error.message);
      }
      
      // Default to enabled if no setting exists
      const enabled = data?.value === 'true' || !data;
      setAdaptiveEnabledState(enabled);
      applyAdaptiveStyles(enabled);
    } catch (error) {
      // Silently default to enabled
      setAdaptiveEnabledState(true);
      applyAdaptiveStyles(true);
    } finally {
      setLoading(false);
    }
  };

  const setAdaptiveEnabled = (enabled: boolean) => {
    setAdaptiveEnabledState(enabled);
    applyAdaptiveStyles(enabled);
  };

  const applyAdaptiveStyles = (enabled: boolean) => {
    const root = document.documentElement;
    
    if (enabled) {
      root.classList.add('adaptive-ui');
      // Apply adaptive UI enhancements
      root.style.setProperty('--adaptive-spacing', '1.2');
      root.style.setProperty('--adaptive-radius', '1.3');
      root.style.setProperty('--adaptive-shadow', '1.5');
    } else {
      root.classList.remove('adaptive-ui');
      root.style.removeProperty('--adaptive-spacing');
      root.style.removeProperty('--adaptive-radius');
      root.style.removeProperty('--adaptive-shadow');
    }
  };

  useEffect(() => {
    applyAdaptiveStyles(adaptiveEnabled);
  }, [adaptiveEnabled]);

  return (
    <AdaptiveUIContext.Provider value={{
      adaptiveEnabled,
      setAdaptiveEnabled,
      loading
    }}>
      {children}
    </AdaptiveUIContext.Provider>
  );
};
