import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CustomStylesLoader = () => {
  const [customCss, setCustomCss] = useState('');

  useEffect(() => {
    loadCustomCss();

    // Subscribe to changes in settings
    const channel = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: 'key=eq.custom_css',
        },
        () => {
          loadCustomCss();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCustomCss = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'custom_css')
        .single();

      if (error) throw error;
      setCustomCss(data?.value || '');
    } catch (error) {
      console.error('Error loading custom CSS:', error);
    }
  };

  useEffect(() => {
    // Remove previous custom styles
    const existingStyle = document.getElementById('custom-admin-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new custom styles
    if (customCss) {
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-admin-styles';
      styleElement.textContent = customCss;
      document.head.appendChild(styleElement);
    }

    return () => {
      const styleElement = document.getElementById('custom-admin-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [customCss]);

  return null;
};

export default CustomStylesLoader;
