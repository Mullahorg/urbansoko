import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomStyles {
  headerCss: string;
  contentCss: string;
  footerCss: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

const fontFamilyMap: Record<string, string> = {
  default: 'Inter, system-ui, sans-serif',
  serif: 'Georgia, serif',
  mono: 'ui-monospace, monospace',
  playfair: '"Playfair Display", serif',
  roboto: 'Roboto, sans-serif',
};

const borderRadiusMap: Record<string, string> = {
  none: '0px',
  sm: '4px',
  default: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

const CustomStylesLoader = () => {
  const [customCss, setCustomCss] = useState('');
  const [siteStyles, setSiteStyles] = useState<CustomStyles | null>(null);

  useEffect(() => {
    loadCustomCss();
    loadSiteStyles();

    // Subscribe to changes in settings
    const settingsChannel = supabase
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

    // Subscribe to site content changes
    const contentChannel = supabase
      .channel('site_styles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
        },
        () => {
          loadSiteStyles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(contentChannel);
    };
  }, []);

  const loadCustomCss = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'custom_css')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCustomCss(data?.value || '');
    } catch (error) {
      console.error('Error loading custom CSS:', error);
    }
  };

  const loadSiteStyles = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section', 'customStyles')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSiteStyles((data?.content as unknown as CustomStyles) || null);
    } catch (error) {
      console.error('Error loading site styles:', error);
    }
  };

  useEffect(() => {
    // Remove previous custom styles
    const existingStyle = document.getElementById('custom-admin-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Build combined CSS
    let combinedCss = '';

    // Add visual theme CSS variables
    if (siteStyles) {
      let rootVars = ':root {';
      if (siteStyles.primaryColor) {
        rootVars += `--custom-primary: ${siteStyles.primaryColor};`;
      }
      if (siteStyles.secondaryColor) {
        rootVars += `--custom-secondary: ${siteStyles.secondaryColor};`;
      }
      if (siteStyles.fontFamily && fontFamilyMap[siteStyles.fontFamily]) {
        rootVars += `--custom-font: ${fontFamilyMap[siteStyles.fontFamily]};`;
      }
      if (siteStyles.borderRadius && borderRadiusMap[siteStyles.borderRadius]) {
        rootVars += `--custom-radius: ${borderRadiusMap[siteStyles.borderRadius]};`;
      }
      rootVars += '}';
      
      if (rootVars !== ':root {}') {
        combinedCss += rootVars;
      }

      // Apply theme styles
      if (siteStyles.primaryColor) {
        combinedCss += `.btn-primary, .bg-primary { background-color: ${siteStyles.primaryColor} !important; }`;
        combinedCss += `.text-primary { color: ${siteStyles.primaryColor} !important; }`;
        combinedCss += `.border-primary { border-color: ${siteStyles.primaryColor} !important; }`;
      }
      if (siteStyles.fontFamily && fontFamilyMap[siteStyles.fontFamily]) {
        combinedCss += `body { font-family: ${fontFamilyMap[siteStyles.fontFamily]} !important; }`;
      }
      if (siteStyles.borderRadius && borderRadiusMap[siteStyles.borderRadius]) {
        combinedCss += `.rounded, .card, .btn { border-radius: ${borderRadiusMap[siteStyles.borderRadius]} !important; }`;
      }

      // Add section-specific CSS
      if (siteStyles.headerCss) {
        combinedCss += `/* Header CSS */ ${siteStyles.headerCss}`;
      }
      if (siteStyles.contentCss) {
        combinedCss += `/* Content CSS */ ${siteStyles.contentCss}`;
      }
      if (siteStyles.footerCss) {
        combinedCss += `/* Footer CSS */ ${siteStyles.footerCss}`;
      }
    }

    // Add legacy custom CSS from settings
    if (customCss) {
      combinedCss += `/* Legacy Custom CSS */ ${customCss}`;
    }

    // Add new custom styles
    if (combinedCss) {
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-admin-styles';
      styleElement.textContent = combinedCss;
      document.head.appendChild(styleElement);
    }

    return () => {
      const styleElement = document.getElementById('custom-admin-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [customCss, siteStyles]);

  return null;
};

export default CustomStylesLoader;
