'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headerBgColor: string;
  footerBgColor: string;
  linkColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headerBgColor: '#ffffff',
  footerBgColor: '#1f2937',
  linkColor: '#3b82f6',
  buttonBgColor: '#3b82f6',
  buttonTextColor: '#ffffff',
};

const ThemeContext = createContext<ThemeSettings>(defaultTheme);

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings?key=theme')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          const parsedTheme = JSON.parse(data.value);
          setTheme({ ...defaultTheme, ...parsedTheme });
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (loaded) {
      // Apply CSS variables to document root
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-secondary', theme.secondaryColor);
      root.style.setProperty('--color-background', theme.backgroundColor);
      root.style.setProperty('--color-text', theme.textColor);
      root.style.setProperty('--color-header-bg', theme.headerBgColor);
      root.style.setProperty('--color-footer-bg', theme.footerBgColor);
      root.style.setProperty('--color-link', theme.linkColor);
      root.style.setProperty('--color-button-bg', theme.buttonBgColor);
      root.style.setProperty('--color-button-text', theme.buttonTextColor);
    }
  }, [theme, loaded]);

  return (
    <ThemeContext.Provider value={theme}>
      <div
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          minHeight: '100vh'
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
