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

  const colors = {
    light: {
      primary: '#283618',
      secondary: '#606C38',
      accent: '#DDA15E',
      background: '#FFFF',
      surface: '#FFFFFF',
      text: {
        primary: '#283618',
        secondary: '#606C38',
        accent: '#DDA15E',
        muted: '#6B7280',
        inverse: '#FEFAE0'
      },
      border: '#E8F5E8',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },
    dark: {
      primary: '#FEFAE0',
      secondary: '#A0A890',
      accent: '#DDA15E',
      background: '#1A1F1A',
      surface: '#2A2F2A',
      text: {
        primary: '#FEFAE0',
        secondary: '#A0A890',
        accent: '#DDA15E',
        muted: '#9CA3AF',
        inverse: '#283618'
      },
      border: '#3A3F3A',
      success: '#34D399',
      error: '#F87171',
      warning: '#FBBF24',
      info: '#60A5FA'
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
