import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';
import { useTheme } from './ThemeContext';

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState({
    profile: null,
    theme: null,
    sections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setThemeMode, setAccentColor, setFontFamily } = useTheme();

  const fetchPortfolio = useCallback(async (username) => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (username) {
        res = await api.get(`/portfolio/${username}/`);
      } else if (localStorage.getItem('access_token')) {
        res = await api.get('/portfolio/my/');
      } else {
        setPortfolio({ profile: null, theme: null, sections: [] });
        setLoading(false);
        return;
      }
      setPortfolio(res.data);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply theme settings globally from API
  useEffect(() => {
    if (portfolio.theme) {
      if (!localStorage.getItem('user-theme-mode')) {
        setThemeMode(portfolio.theme.mode || 'system');
      }
      setAccentColor(portfolio.theme.accent_color || '#6366f1');
      if (setFontFamily) {
        setFontFamily(portfolio.theme.font_family || 'Inter');
      }
    }
  }, [portfolio.theme, setThemeMode, setAccentColor, setFontFamily]);


  const value = useMemo(
    () => ({
      ...portfolio,
      loading,
      error,
      refetch: fetchPortfolio,
    }),
    [portfolio, loading, error, fetchPortfolio]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
