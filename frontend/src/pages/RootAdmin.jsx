import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginGate from '../components/admin/LoginGate';
import api from '../api/axiosConfig';
import {
  FiUsers, FiPlus, FiTrash2, FiLogOut, FiExternalLink, FiMail, FiUser, FiCheck, FiX, FiLock, FiShield,
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

  // Access control edit states
  const [editingAccessUserId, setEditingAccessUserId] = useState(null);
  const [editAccessType, setEditAccessType] = useState('trial');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editBlockedByAdmin, setEditBlockedByAdmin] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editBlockReason, setEditBlockReason] = useState('');

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
    
    const cleanedUsername = username.trim();
    const reservedUsernames = [
      'admin', 'payment', 'template', 'showcase', 'master-admin', 'root-admin',
      'api', 'static', 'media', 'login', 'logout', 'register', 'dashboard',
      'pricing', 'features', 'contact', 'mimi', 'help', 'support'
    ];
    if (/\s/.test(cleanedUsername)) {
      setErrorMsg('Username cannot contain spaces');
      setSubmitting(false);
      return;
    }
    if (cleanedUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters');
      setSubmitting(false);
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(cleanedUsername)) {
      setErrorMsg('Only letters, numbers, and - allowed for usernames');
      setSubmitting(false);
      return;
    }
    if (reservedUsernames.includes(cleanedUsername.toLowerCase())) {
      setErrorMsg('This username is reserved and cannot be used');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/admin/users/', {
        username: cleanedUsername,
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

  const handleStartEditAccess = (user) => {
    const status = user.access_status || {};
    setEditingAccessUserId(user.id);
    setEditAccessType(status.access_type || 'trial');
    
    // Format expires_at from ISO to YYYY-MM-DD
    let dateStr = '';
    if (status.expires_at) {
      dateStr = status.expires_at.split('T')[0];
    }
    setEditExpiresAt(dateStr);
    setEditBlockedByAdmin(!!status.blocked_by_admin);
    setEditIsActive(status.is_active !== false); // default to true
    setEditBlockReason(status.block_reason || '');
  };

  const handleUpdateAccess = async (accessId, updatedData) => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      
      const payload = {
        access_type: updatedData.access_type,
        blocked_by_admin: updatedData.blocked_by_admin,
        is_active: updatedData.is_active,
        block_reason: updatedData.block_reason,
        expires_at: updatedData.expires_at ? new Date(updatedData.expires_at).toISOString() : null
      };

      await api.patch(`/admin/access/${accessId}/`, payload);
      setSuccessMsg('Access settings updated successfully!');
      setEditingAccessUserId(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update access:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update access settings.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const getAccessBadgeStyle = (status) => {
    if (!status) return { text: 'No Access Record', bg: 'rgba(100,116,139,0.1)', color: '#64748b' };
    if (status.blocked_by_admin) {
      return { text: 'Blocked by Admin', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
    }
    if (!status.is_active) {
      return { text: 'Disabled', bg: 'rgba(100,116,139,0.1)', color: '#64748b' };
    }
    if (status.access_type === 'lifetime') {
      return { text: 'Lifetime', bg: 'rgba(168,85,247,0.1)', color: '#a855f7' };
    }
    if (status.expires_at) {
      const expiry = new Date(status.expires_at);
      if (new Date() > expiry) {
        return { text: 'Expired', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
      }
      const typeStr = status.access_type === 'paid' ? 'Paid' : 'Trial';
      return { 
        text: `${typeStr} (Active)`, 
        bg: 'rgba(34,197,94,0.1)', 
        color: '#22c55e' 
      };
    }
    return { text: 'Active', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' };
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="root-users-list">
                {users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '16px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    className="root-user-row"
                  >
                    {/* Top row: User summary details & action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                          {(() => {
                            const badge = getAccessBadgeStyle(user.access_status);
                            return (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: badge.bg,
                                  color: badge.color,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  border: `1px solid color-mix(in srgb, ${badge.color} 20%, transparent)`,
                                }}
                              >
                                {badge.text}
                              </span>
                            );
                          })()}
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {user.email}
                        </span>
                        {user.allocated_password && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 600 }}>Password:</span>
                            <code style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                              {user.allocated_password}
                            </code>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user.access_status && (
                          <button
                            className="btn-icon"
                            onClick={() => {
                              if (editingAccessUserId === user.id) {
                                setEditingAccessUserId(null);
                              } else {
                                handleStartEditAccess(user);
                              }
                            }}
                            style={{
                              color: editingAccessUserId === user.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                              borderColor: editingAccessUserId === user.id ? 'var(--accent-color)' : 'var(--border-color)',
                              width: '32px',
                              height: '32px',
                              background: editingAccessUserId === user.id ? 'color-mix(in srgb, var(--accent-color) 8%, transparent)' : 'transparent',
                            }}
                            title="Manage Access"
                          >
                            <FiShield size={14} />
                          </button>
                        )}

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
                            disabled={user.is_superuser}
                          >
                            <FiTrash2 size={14} style={{ opacity: user.is_superuser ? 0.3 : 1 }} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom collapsible: access controls editor */}
                    {editingAccessUserId === user.id && user.access_status && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '16px',
                          marginTop: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiShield size={14} style={{ color: 'var(--accent-color)' }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                            Configure User Access
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label className="label" style={{ fontSize: '11px', marginBottom: '4px' }}>Access Type</label>
                            <select
                              className="input-field"
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
                              value={editAccessType}
                              onChange={(e) => setEditAccessType(e.target.value)}
                            >
                              <option value="trial">Trial</option>
                              <option value="paid">Paid</option>
                              <option value="lifetime">Lifetime</option>
                            </select>
                          </div>

                          <div>
                            <label className="label" style={{ fontSize: '11px', marginBottom: '4px' }}>Expires At</label>
                            <input
                              type="date"
                              className="input-field"
                              style={{ padding: '7px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
                              value={editExpiresAt}
                              disabled={editAccessType === 'lifetime'}
                              onChange={(e) => setEditExpiresAt(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="toggle-switch" style={{ width: '40px', height: '22px' }}>
                              <input
                                type="checkbox"
                                id={`active-${user.id}`}
                                checked={editIsActive}
                                onChange={(e) => setEditIsActive(e.target.checked)}
                              />
                              <label className="toggle-slider" htmlFor={`active-${user.id}`} style={{ borderRadius: '11px' }}></label>
                            </div>
                            <label htmlFor={`active-${user.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                              Access Enabled
                            </label>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="toggle-switch" style={{ width: '40px', height: '22px' }}>
                              <input
                                type="checkbox"
                                id={`blocked-${user.id}`}
                                checked={editBlockedByAdmin}
                                onChange={(e) => setEditBlockedByAdmin(e.target.checked)}
                              />
                              <label className="toggle-slider" htmlFor={`blocked-${user.id}`} style={{ borderRadius: '11px' }}></label>
                            </div>
                            <label htmlFor={`blocked-${user.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                              Manually Block Access (Overrides Expiration)
                            </label>
                          </div>
                        </div>

                        {editBlockedByAdmin && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="label" style={{ fontSize: '11px', marginBottom: '2px' }}>Block Reason</label>
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
                              placeholder="Reason (e.g. Payment not received, terms violation)"
                              value={editBlockReason}
                              onChange={(e) => setEditBlockReason(e.target.value)}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                          <button
                            className="btn-ghost"
                            style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: 'var(--radius-sm)' }}
                            onClick={() => setEditingAccessUserId(null)}
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-accent"
                            style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: 'var(--radius-sm)' }}
                            onClick={() => handleUpdateAccess(user.access_status.id, {
                              access_type: editAccessType,
                              expires_at: editExpiresAt,
                              blocked_by_admin: editBlockedByAdmin,
                              is_active: editIsActive,
                              block_reason: editBlockReason,
                            })}
                            disabled={submitting}
                          >
                            {submitting ? 'Saving...' : 'Save Settings'}
                          </button>
                        </div>
                      </motion.div>
                    )}
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
