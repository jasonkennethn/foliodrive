import { useState, useCallback } from 'react';
import api from '../api/axiosConfig';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem('access_token')
  );
  const [isSuperuser, setIsSuperuser] = useState(
    () => sessionStorage.getItem('is_superuser') === 'true'
  );
  const [isStaff, setIsStaff] = useState(
    () => sessionStorage.getItem('is_staff') === 'true'
  );
  const [username, setUsername] = useState(
    () => sessionStorage.getItem('username') || ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      sessionStorage.setItem('access_token', res.data.access);
      sessionStorage.setItem('refresh_token', res.data.refresh);
      sessionStorage.setItem('is_superuser', isSuper ? 'true' : 'false');
      sessionStorage.setItem('is_staff', isStf ? 'true' : 'false');
      sessionStorage.setItem('username', uName || '');
      
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
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('is_superuser');
    sessionStorage.removeItem('is_staff');
    sessionStorage.removeItem('username');
    setIsAuthenticated(false);
    setIsSuperuser(false);
    setIsStaff(false);
    setUsername('');
  }, []);

  return { isAuthenticated, isSuperuser, isStaff, username, login, logout, error, loading };
}
