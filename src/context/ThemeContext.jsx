import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ isDark: true, toggle: () => {} });

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const guardado = localStorage.getItem('mg_theme');
    return guardado ? guardado === 'dark' : true;
  });

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.setAttribute('data-theme', isDark ? 'dark' : 'light');
    raiz.classList.toggle('dark', isDark);
    localStorage.setItem('mg_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);