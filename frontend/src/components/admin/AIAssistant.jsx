import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiCheck, FiX, FiRefreshCw, FiZap } from 'react-icons/fi';
import api from '../../api/axiosConfig';

export default function AIAssistant({ fieldType, currentText, onApply, role = 'Professional' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState(currentText || '');
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState(fieldType || 'description');

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please provide some initial text or notes for the AI.');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestion('');

    try {
      const res = await api.post('/ai/assist/', {
        field_type: selectedType,
        current_text: inputText.trim(),
        role: role
      });
      setSuggestion(res.data.suggested_text);
    } catch (err) {
      console.error('AI assistant error:', err);
      const msg = err.response?.data?.error || 'Failed to connect to Gemini AI. Check that the API key is configured.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion && onApply) {
      onApply(suggestion);
      setOpen(false);
    }
  };

  return (
    <div style={{ display: 'inline-block' }} className="ai-assistant-wrapper">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setInputText(currentText || '');
          setSuggestion('');
          setError('');
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
          border: '1px solid rgba(168,85,247,0.3)',
          color: '#c084fc',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = '1px solid rgba(168,85,247,0.6)';
          e.currentTarget.style.boxShadow = '0 0 10px rgba(168,85,247,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = '1px solid rgba(168,85,247,0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <FiCpu size={13} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
        <span>AI Writer</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1100,
              }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: '15%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '500px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1101,
                fontFamily: 'var(--font-primary)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCpu style={{ color: 'var(--accent-color)' }} />
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Gemini AI Assistant
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Selector / Radio Options */}
              <div style={{ marginBottom: '14px' }}>
                <label className="label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Select AI Action</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'tagline', label: 'Improve Tagline' },
                    { id: 'bio', label: 'Professional Bio' },
                    { id: 'description', label: 'Polish Copy' },
                    { id: 'bullets', label: 'Bullet Points' },
                    { id: 'ats_optimize', label: 'ATS Optimize' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedType(opt.id)}
                      style={{
                        background: selectedType === opt.id ? 'var(--accent-color)' : 'var(--bg-elevated)',
                        color: selectedType === opt.id ? '#ffffff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input text / notes */}
              <div style={{ marginBottom: '16px' }}>
                <label className="label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Input Draft / Initial Notes
                </label>
                <textarea
                  className="input-field"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your current draft or type quick bullet points/notes here..."
                  rows={4}
                  style={{ fontSize: '13px', lineHeight: 1.4, resize: 'vertical' }}
                />
              </div>

              {/* Error block */}
              {error && (
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#ef4444',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '6px',
                    marginBottom: '16px',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Action generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, var(--accent-color) 0%, #a855f7 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <FiRefreshCw size={14} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                    Generating suggestion...
                  </>
                ) : (
                  <>
                    <FiZap size={14} />
                    Generate Suggestion
                  </>
                )}
              </button>

              {/* Suggestions Box Output */}
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}
                >
                  <label className="label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    AI Suggestion Preview
                  </label>
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      color: 'var(--text-primary)',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      marginBottom: '14px',
                    }}
                  >
                    {suggestion}
                  </div>
                  <button
                    type="button"
                    onClick={handleApply}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                    }}
                  >
                    <FiCheck size={14} />
                    Apply Suggestion
                  </button>
                </motion.div>
              )}
            </motion.div>
            
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); }}
            `}</style>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
