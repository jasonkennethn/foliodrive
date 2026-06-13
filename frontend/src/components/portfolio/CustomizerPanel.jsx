import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import { FiDroplet, FiSun, FiMoon, FiX, FiCheck, FiSliders, FiSmile } from 'react-icons/fi';

const PRESET_COLORS = [
  '#6366f1', // Indigo (Default)
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#f59e0b', // Amber
];

const FONTS = [
  'Inter',
  'Outfit',
  'Roboto',
  'Playfair Display',
  'Plus Jakarta Sans',
  'Montserrat',
];

export default function CustomizerPanel({ isOpen, onClose }) {
  const { 
    themeMode, setThemeMode, 
    accentColor, setAccentColor, 
    fontFamily, setFontFamily 
  } = useTheme();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleModeChange = async (mode) => {
    setThemeMode(mode);
    localStorage.setItem('user-theme-mode', mode);
    saveSettings(mode, accentColor, fontFamily);
  };

  const handleColorChange = (color) => {
    setAccentColor(color);
  };

  const handleColorSelect = async (color) => {
    setAccentColor(color);
    saveSettings(themeMode, color, fontFamily);
  };

  const handleFontChange = async (font) => {
    setFontFamily(font);
    saveSettings(themeMode, accentColor, font);
  };

  const saveSettings = async (mode, color, font) => {
    setSaving(true);
    try {
      await api.put('/theme/', {
        mode,
        accent_color: color,
        font_family: font,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save customizer settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(2px)',
              zIndex: 1040,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: '64px',
              right: 0,
              bottom: 0,
              width: '320px',
              maxWidth: '100vw',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1045,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              overflowY: 'auto',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-primary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSliders size={18} style={{ color: 'var(--accent-color)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Customize Look</h3>
              </div>
              <button 
                onClick={onClose} 
                className="btn-icon" 
                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Mode selection */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                Theme Mode
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'light', label: 'Light', icon: FiSun },
                  { value: 'dark', label: 'Dark', icon: FiMoon },
                  { value: 'system', label: 'System', icon: FiSmile },
                ].map(m => {
                  const Icon = m.icon;
                  const isActive = themeMode === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => handleModeChange(m.value)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: isActive ? 'color-mix(in srgb, var(--accent-color) 12%, transparent)' : 'var(--bg-surface)',
                        border: `1.5px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        transition: 'all var(--transition-fast)',
                        fontFamily: 'var(--font-primary)',
                      }}
                    >
                      <Icon size={16} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color selection */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                Accent Color
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      border: accentColor === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    title={color}
                  />
                ))}
              </div>
              
              <button
                className="btn-ghost"
                onClick={() => setShowPicker(!showPicker)}
                style={{ fontSize: '12px', padding: '6px 12px', width: '100%', justifyContent: 'center' }}
              >
                <FiDroplet size={14} />
                {showPicker ? 'Close Picker' : 'Choose Custom Color'}
              </button>

              {showPicker && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <HexColorPicker
                    color={accentColor}
                    onChange={handleColorChange}
                    style={{ width: '100%' }}
                  />
                  <button
                    className="btn-accent"
                    onClick={() => handleColorSelect(accentColor)}
                    style={{ fontSize: '12px', padding: '8px', justifyContent: 'center', width: '100%' }}
                  >
                    Apply Color
                  </button>
                </div>
              )}
            </div>

            {/* Font Family selection */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                Font Family
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {FONTS.map(font => {
                  const isActive = fontFamily === font;
                  return (
                    <button
                      key={font}
                      onClick={() => handleFontChange(font)}
                      style={{
                        padding: '10px 14px',
                        background: isActive ? 'color-mix(in srgb, var(--accent-color) 8%, transparent)' : 'var(--bg-surface)',
                        border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: isActive ? 'var(--accent-color)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        textAlign: 'left',
                        fontFamily: font,
                        transition: 'all var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{font}</span>
                      {isActive && <FiCheck size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status indicator */}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              {saving ? (
                <span>Saving changes...</span>
              ) : saved ? (
                <span style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCheck /> Auto-saved successfully
                </span>
              ) : (
                <span>All modifications auto-save</span>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
