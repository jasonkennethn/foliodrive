import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { FiLock, FiUser, FiLogIn } from 'react-icons/fi';

export default function LoginGate({ onAuthenticated, requiredRole = 'staff' }) {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password, requiredRole);
    if (success && onAuthenticated) {
      onAuthenticated();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 10% 20%, color-mix(in srgb, var(--accent-color) 8%, transparent) 0%, transparent 45%),
                    radial-gradient(circle at 90% 80%, color-mix(in srgb, var(--accent-color) 6%, transparent) 0%, transparent 45%),
                    var(--bg-primary)`,
        backgroundAttachment: 'fixed',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(20px, 8vw, 40px)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <FiLock size={24} style={{ color: 'var(--accent-color)' }} />
          </motion.div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            Admin Access
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Sign in to manage your portfolio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Username or Email</label>
            <div style={{ position: 'relative' }}>
              <FiUser
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                required
                autoFocus
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px',
                fontSize: '13px',
                color: '#ef4444',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="btn-accent"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              fontSize: '15px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
            ) : (
              <>
                <FiLogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </motion.div>
    </div>
  );
}
