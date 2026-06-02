import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginGate from '../components/admin/LoginGate';
import api from '../api/axiosConfig';
import {
  FiUsers, FiPlus, FiTrash2, FiLogOut, FiExternalLink, FiMail, FiUser, FiCheck, FiX, FiLock,
} from 'react-icons/fi';

export default function RootAdmin() {
  const { isAuthenticated, isSuperuser, username: loggedInUsername, logout } = useAuth();
  const [authed, setAuthed] = useState(isAuthenticated && isSuperuser);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    document.title = 'Root Admin Panel — Portfolio';
  }, []);

  useEffect(() => {
    if (authed) {
      fetchUsers();
    }
  }, [authed]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users/');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/admin/users/', {
        username: username.trim(),
        email: email.trim(),
        password
      });
      setUsername('');
      setEmail('');
      setPassword('');
      setSuccessMsg('Master-admin user created successfully!');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to create user:', err);
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          const errorVal = errorData[firstKey];
          setErrorMsg(`${firstKey}: ${Array.isArray(errorVal) ? errorVal[0] : errorVal}`);
        } else {
          setErrorMsg(errorData);
        }
      } else {
        setErrorMsg('Failed to create user. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}/`);
      setDeleteConfirmId(null);
      fetchUsers();
      setSuccessMsg('User deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to delete user.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  if (!authed) {
    return (
      <LoginGate
        requiredRole="superuser"
        onAuthenticated={() => setAuthed(true)}
      />
    );
  }

  return (
    <div className="admin-panel" style={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 10% 20%, color-mix(in srgb, var(--accent-color) 8%, transparent) 0%, transparent 45%),
                  radial-gradient(circle at 90% 80%, color-mix(in srgb, var(--accent-color) 6%, transparent) 0%, transparent 45%),
                  var(--bg-primary)`,
      backgroundAttachment: 'fixed',
    }}>
      {/* Root Admin Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 100,
        }}
        className="root-admin-header glass"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUsers size={20} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Root Admin Portal
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`/${loggedInUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ fontSize: '13px', padding: '6px 14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiExternalLink size={14} />
            View Site
          </a>
          <button className="btn-accent" onClick={handleLogout} style={{ fontSize: '13px', padding: '6px 14px' }}>
            <FiLogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '96px 32px 48px',
        }}
        className="root-admin-content"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '32px',
            alignItems: 'start',
          }}
          className="root-admin-grid"
        >
          {/* Create User Card Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass"
            style={{
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FiPlus size={18} />
              Create Master Admin
            </h2>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Username</label>
                <div style={{ position: 'relative' }}>
                  <FiUser
                    size={16}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail
                    size={16}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <FiLock
                    size={16}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password"
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#ef4444',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn-accent"
                disabled={submitting}
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </motion.div>

          {/* Master Admin List */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
              minHeight: '400px',
            }}
            className="root-users-card glass"
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FiUsers size={18} />
              Master Admin Accounts
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                No master-admin users found in the system.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="root-users-list">
                {users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    className="root-user-row"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 650, color: 'var(--text-primary)', fontSize: '15px' }}>
                          {user.username}
                        </span>
                        {user.is_superuser && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)',
                              color: 'var(--accent-color)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              border: '1px solid color-mix(in srgb, var(--accent-color) 25%, transparent)',
                            }}
                          >
                            Superuser
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {user.email}
                      </span>
                      {user.allocated_password && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 600 }}>Password:</span>
                          <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                            {user.allocated_password}
                          </code>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {deleteConfirmId === user.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ background: '#ef4444', color: '#fff', width: '28px', height: '28px' }}
                            title="Confirm delete"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => setDeleteConfirmId(null)}
                            style={{ width: '28px', height: '28px' }}
                            title="Cancel delete"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteConfirmId(user.id)}
                          style={{ color: '#ef4444', width: '32px', height: '32px' }}
                          title="Delete account"
                          disabled={user.is_superuser} // Disable delete for superuser accounts
                        >
                          <FiTrash2 size={14} style={{ opacity: user.is_superuser ? 0.3 : 1 }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="toast toast-success"
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiCheck size={16} />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local Responsive Styles Override */}
      <style>{`
        @media (max-width: 900px) {
          .root-admin-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .root-admin-content {
            padding: 80px 16px 32px !important;
          }
          .root-admin-header {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
