import { useState, useCallback, useEffect } from 'react';
import api from '../api/axiosConfig';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Check heartbeat session timeout if loading the tab freshly
    const isTabActive = sessionStorage.getItem('tab_active') === 'true';
    if (!isTabActive) {
      const lastActive = localStorage.getItem('last_active_timestamp');
      if (lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed > 300000) { // 5 minutes in milliseconds
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('is_superuser');
          localStorage.removeItem('is_staff');
          localStorage.removeItem('username');
          localStorage.removeItem('last_active_timestamp');
          return false;
        }
      }
    }
    sessionStorage.setItem('tab_active', 'true');
    return true;
  });

  const [isSuperuser, setIsSuperuser] = useState(
    () => localStorage.getItem('is_superuser') === 'true'
  );
  const [isStaff, setIsStaff] = useState(
    () => localStorage.getItem('is_staff') === 'true'
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Heartbeat - keep last_active_timestamp updated while user is active or tab is open
  useEffect(() => {
    if (!isAuthenticated) return;

    localStorage.setItem('last_active_timestamp', Date.now().toString());

    const heartbeat = setInterval(() => {
      localStorage.setItem('last_active_timestamp', Date.now().toString());
    }, 10000); // every 10 seconds

    const updateActivity = () => {
      localStorage.setItem('last_active_timestamp', Date.now().toString());
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [isAuthenticated]);

  const login = useCallback(async (usernameVal, password, requiredRole = 'staff') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/token/', { username: usernameVal, password });
      
      const isSuper = res.data.is_superuser;
      const isStf = res.data.is_staff;
      const uName = res.data.username;
      
      if (requiredRole === 'superuser' && !isSuper) {
        setError('Access denied. Superuser privileges required.');
        return false;
      }
      
      if (requiredRole === 'staff' && !isStf) {
        setError('Access denied. Staff privileges required.');
        return false;
      }

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('is_superuser', isSuper ? 'true' : 'false');
      localStorage.setItem('is_staff', isStf ? 'true' : 'false');
      localStorage.setItem('username', uName || '');
      localStorage.setItem('last_active_timestamp', Date.now().toString());
      sessionStorage.setItem('tab_active', 'true');
      
      setIsAuthenticated(true);
      setIsSuperuser(isSuper);
      setIsStaff(isStf);
      setUsername(uName || '');
      return true;
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Invalid username/email or password'
          : 'Login failed. Please try again.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_superuser');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('username');
    localStorage.removeItem('last_active_timestamp');
    sessionStorage.removeItem('tab_active');
    setIsAuthenticated(false);
    setIsSuperuser(false);
    setIsStaff(false);
    setUsername('');
  }, []);

  return { isAuthenticated, isSuperuser, isStaff, username, login, logout, error, loading };
}

