import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Extended color palette with Home page specific colors
  const colors = {
    light: {
      // Base colors
      primary: '#283618',
      secondary: '#52B788',
      accent: '#DDA15E',
      background: '#FFFF',
      surface: '#FFFFFF',
      
      // Text colors
      text: {
        primary: '#283618',
        secondary: '#52B788',
        accent: '#DDA15E',
        muted: '#6B7280',
        inverse: '#FEFAE0'
      },
      
      // Border colors
      border: '#E8F5E8',
      
      // Status colors
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      
      // Home page specific colors
      home: {
        cream: '#FAF7F2',
        beige: '#F0EBE1',
        greenLight: '#52B788',
        greenPale: '#D8F3DC',
        greenDark: '#1B4332',
        olive: '#74A57F',
        gold: '#E9C46A',
        text: '#1C1C1C',
        muted: '#6B7280',
        border: '#E5E0D8',
        sale: '#E63946',
        orange: '#F97316',
        white: '#FFFFFF',
      }
    },
    dark: {
      // Base colors
      primary: '#FEFAE0',
      secondary: '#A0A890',
      accent: '#DDA15E',
      background: '#1A1F1A',
      surface: '#2A2F2A',
      
      // Text colors
      text: {
        primary: '#FEFAE0',
        secondary: '#A0A890',
        accent: '#DDA15E',
        muted: '#9CA3AF',
        inverse: '#283618'
      },
      
      // Border colors
      border: '#3A3F3A',
      
      // Status colors
      success: '#34D399',
      error: '#F87171',
      warning: '#FBBF24',
      info: '#60A5FA',
      
      // Home page specific colors (dark mode variations)
      home: {
        cream: '#2A2F2A',
        beige: '#3A3F3A',
        greenLight: '#409B6E',
        greenPale: '#1B4332',
        greenDark: '#52B788',
        olive: '#8B9A8B',
        gold: '#DDA15E',
        text: '#FEFAE0',
        muted: '#9CA3AF',
        border: '#3A3F3A',
        sale: '#EF4444',
        orange: '#FB923C',
        white: '#2A2F2A',
      }
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme, colors: theme }}>
      {children}
    </ThemeContext.Provider>
  );
};