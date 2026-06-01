import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { FiDroplet, FiSun, FiMoon, FiSave, FiCheck } from 'react-icons/fi';

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
];

const MODES = [
  { value: 'light', label: 'Light', icon: FiSun, desc: 'Always light mode' },
  { value: 'dark', label: 'Dark', icon: FiMoon, desc: 'Always dark mode' },
];

export default function ThemeEditor({ onChanged }) {
  const { setThemeMode, setAccentColor, resolvedTheme } = useTheme();
  const { profile } = usePortfolio();
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await api.get('/theme/');
      const activeMode = localStorage.getItem('user-theme-mode') || res.data.mode || 'light';
      setTheme({ ...res.data, mode: activeMode });
      if (!localStorage.getItem('user-theme-mode')) {
        setThemeMode(res.data.mode);
      }
      setAccentColor(res.data.accent_color);
    } catch (err) {
      console.error('Failed to fetch theme:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setTheme((prev) => ({ ...prev, mode }));
    setThemeMode(mode);
    localStorage.setItem('user-theme-mode', mode); // Save manual override
  };

  const handleColorChange = (color) => {
    setTheme((prev) => ({ ...prev, accent_color: color }));
    setAccentColor(color);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/theme/', {
        mode: theme.mode,
        accent_color: theme.accent_color,
        font_family: theme.font_family || 'Inter',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to save theme:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading theme...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '600px' }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <FiDroplet size={20} />
        Theme Settings
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Mode selector */}
        <div>
          <label className="label">Appearance Mode</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = theme.mode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => handleModeChange(m.value)}
                  style={{
                    flex: '1 1 140px',
                    padding: '14px',
                    background: isActive ? 'color-mix(in srgb, var(--accent-color) 10%, transparent)' : 'var(--bg-surface)',
                    border: `2px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'var(--font-primary)',
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-muted)', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {m.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="label">Accent Color</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: color,
                  border: theme.accent_color === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  outline: theme.accent_color === color ? `2px solid ${color}` : 'none',
                  outlineOffset: '2px',
                }}
                title={color}
              />
            ))}
          </div>
          <button
            className="btn-ghost"
            onClick={() => setShowPicker(!showPicker)}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <FiDroplet size={14} />
            {showPicker ? 'Close' : 'Custom'} Color
          </button>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '12px' }}
            >
              <HexColorPicker
                color={theme.accent_color}
                onChange={handleColorChange}
                style={{ width: '100%', maxWidth: '250px' }}
              />
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: theme.accent_color,
                    border: '1px solid var(--border-color)',
                  }}
                />
                <code style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {theme.accent_color}
                </code>
              </div>
            </motion.div>
          )}
        </div>

        {/* Live Theme Preview */}
        <div>
          <label className="label">Live Theme Preview</label>
          <div
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              transition: 'all var(--transition-base)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Mini Nav */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {profile?.name || 'Jane Doe'}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 650,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--accent-color)',
                    background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-color) 25%, transparent)',
                  }}
                >
                  Governance
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Filings</span>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Contact</span>
              </div>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                }}
              >
                {resolvedTheme === 'light' ? '☀️' : '🌙'}
              </div>
            </div>

            {/* Mini Hero */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--accent-color)', letterSpacing: '0.12em' }}>
                {profile?.custom_intro || "HELLO, I'M"}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {profile?.name || 'Jane Doe'}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {profile?.role || 'Company Secretary & Compliance Officer'}
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '8px',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                }}
              >
                📍 {profile?.location || 'London, UK'}
              </div>
            </div>

            {/* Mini Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Secretarial Audit
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  Execute statutory audits with 100% compliance.
                </div>
                <div style={{ fontSize: '8px', color: 'var(--accent-color)', fontWeight: 600, marginTop: '6px' }}>
                  Learn More →
                </div>
              </div>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Governance Advisory
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  Legal advisory on board and listing standards.
                </div>
                <div style={{ fontSize: '8px', color: 'var(--accent-color)', fontWeight: 600, marginTop: '6px' }}>
                  Learn More →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          className="btn-accent"
          onClick={handleSave}
          disabled={saving}
          style={{ alignSelf: 'flex-start' }}
        >
          {saved ? (
            <>
              <FiCheck size={16} />
              Saved!
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            <>
              <FiSave size={16} />
              Save Theme
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
