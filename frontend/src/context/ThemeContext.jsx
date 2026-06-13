import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

function hexToHSL(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

const FONT_MAP = {
  'Inter': "'Inter', sans-serif",
  'Outfit': "'Outfit', sans-serif",
  'Roboto': "'Roboto', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
};

const loadGoogleFont = (fontName) => {
  if (!fontName) return;
  const formattedFont = fontName.replace(/\s+/g, '+');
  const id = `google-font-${formattedFont}`;
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }
};

export function ThemeProvider({ children }) {
  // Enforce localStorage manual override if it exists, otherwise default to 'system'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('user-theme-mode') || 'system';
  });
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [resolvedTheme, setResolvedTheme] = useState('light'); // actual applied theme

  // Resolve the actual theme based on mode
  const resolveTheme = useCallback((mode) => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }, []);

  // Dynamically load font and apply it to CSS variables
  useEffect(() => {
    loadGoogleFont(fontFamily);
    const cssFontValue = FONT_MAP[fontFamily] || `'${fontFamily}', sans-serif`;
    document.documentElement.style.setProperty('--font-primary', cssFontValue);
  }, [fontFamily]);


  // Apply theme to DOM
  useEffect(() => {
    const resolved = resolveTheme(themeMode);
    setResolvedTheme(resolved);

    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  // Dynamically update UI color variables based on accent color HSL
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);

    // Sync Tailwind semantic accent tokens with the legacy accent color
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--ring', accentColor);

    // Calculate hover color (slightly darker)
    const r = parseInt(accentColor.slice(1, 3), 16) || 0;
    const g = parseInt(accentColor.slice(3, 5), 16) || 0;
    const b = parseInt(accentColor.slice(5, 7), 16) || 0;
    const hoverColor = `#${Math.max(0, r - 20).toString(16).padStart(2, '0')}${Math.max(0, g - 20).toString(16).padStart(2, '0')}${Math.max(0, b - 20).toString(16).padStart(2, '0')}`;
    document.documentElement.style.setProperty('--accent-hover', hoverColor);

    const hsl = hexToHSL(accentColor);

    let metaBg = '';
    if (resolvedTheme === 'dark') {
      // Dark Mode backgrounds derived from the selected accent color HSL
      const s_bg = Math.max(12, Math.min(24, hsl.s - 20));
      const s_surf = Math.max(10, Math.min(18, hsl.s - 25));
      metaBg = `hsl(${hsl.h}, ${s_bg}%, 8%)`;

      document.documentElement.style.setProperty('--bg-primary', metaBg);
      document.documentElement.style.setProperty('--bg-surface', `hsl(${hsl.h}, ${s_surf}%, 12%)`);
      document.documentElement.style.setProperty('--bg-elevated', `hsl(${hsl.h}, ${s_surf}%, 18%)`);
      document.documentElement.style.setProperty('--border-color', `hsl(${hsl.h}, ${s_surf}%, 19%)`);
      document.documentElement.style.setProperty('--text-primary', `hsl(${hsl.h}, 10%, 94%)`);
      document.documentElement.style.setProperty('--text-secondary', `hsl(${hsl.h}, 8%, 74%)`);
      document.documentElement.style.setProperty('--text-muted', `hsl(${hsl.h}, 8%, 46%)`);
      document.documentElement.style.setProperty('--glass-bg', `hsla(${hsl.h}, ${s_bg}%, 8%, 0.75)`);
      document.documentElement.style.setProperty('--glass-border', `hsla(${hsl.h}, 10%, 100%, 0.05)`);
    } else {
      // Light Mode backgrounds derived from the selected accent color HSL
      const s_bg = Math.max(8, Math.min(15, hsl.s - 30));
      metaBg = `hsl(${hsl.h}, ${s_bg}%, 98%)`;

      document.documentElement.style.setProperty('--bg-primary', metaBg);
      document.documentElement.style.setProperty('--bg-surface', `hsl(${hsl.h}, 10%, 100%)`);
      document.documentElement.style.setProperty('--bg-elevated', `hsl(${hsl.h}, 12%, 94%)`);
      document.documentElement.style.setProperty('--border-color', `hsl(${hsl.h}, 12%, 90%)`);
      document.documentElement.style.setProperty('--text-primary', `hsl(${hsl.h}, 20%, 8%)`);
      document.documentElement.style.setProperty('--text-secondary', `hsl(${hsl.h}, 12%, 32%)`);
      document.documentElement.style.setProperty('--text-muted', `hsl(${hsl.h}, 8%, 58%)`);
      document.documentElement.style.setProperty('--glass-bg', `hsla(${hsl.h}, ${s_bg}%, 98%, 0.75)`);
      document.documentElement.style.setProperty('--glass-border', `hsla(${hsl.h}, 12%, 0%, 0.06)`);
    }

    // Update <meta name="theme-color"> tag dynamically
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', metaBg);
  }, [accentColor, resolvedTheme]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const current = prev === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
        : prev;
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('user-theme-mode', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        resolvedTheme,
        accentColor,
        setAccentColor,
        fontFamily,
        setFontFamily,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
