import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiMail, FiUser, FiMessageSquare, FiPhone, FiInfo, FiExternalLink } from 'react-icons/fi';
import api from '../api/axiosConfig';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/contacts/', {
        name: name.trim(),
        email: email.trim(),
        description: description.trim(),
        phone: phone.trim(),
      });
      setName('');
      setEmail('');
      setDescription('');
      setPhone('');
      setSuccessMsg('Inquiry submitted! We will get back to you immediately.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to submit contact request:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to send inquiry. Please check your inputs and try again.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #09090b 100%)',
        color: '#f4f4f5',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Blur Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          top: '-10%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          bottom: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 40px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          zIndex: 10,
        }}
        className="landing-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              color: '#fff',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}
          >
            P
          </div>
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em', background: 'linear-gradient(to right, #ffffff, #d4d4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Portfolify
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }} className="landing-header-buttons">
          <a
            href="/master-admin"
            className="btn-accent"
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(99,102,241,0.2)',
            }}
          >
            Login
          </a>
        </div>
      </header>

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 40px 80px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '64px',
          alignItems: 'center',
          zIndex: 10,
        }}
        className="landing-main"
      >
        {/* Left column: Hook & Intro */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '100px',
              color: '#818cf8',
              fontSize: '13px',
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            <span>⚡</span>
            <span>Create Your Portfolio Website Now!</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 54px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              margin: 0,
            }}
          >
            Showcase your career with a{' '}
            <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              premium website
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: '#a1a1aa', lineHeight: 1.5, margin: 0 }}>
            Designed for professionals, consultants, developers, and experts. Showcase your projects, highlight key skills, log work history, and share your achievements in minutes.
          </p>

          {/* Features Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {[
              'Tailored templates for both general profiles and domain-specialists',
              'Stunning dynamic HSL color themes (fully adjustable to your style)',
              'Drag-and-drop section manager for instant reordering',
              'Smooth responsive designs optimized for Desktop, Tablet, and Mobile views',
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(168, 85, 247, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                    flexShrink: 0,
                  }}
                >
                  <FiCheck size={12} />
                </div>
                <span style={{ fontSize: '15px', color: '#d4d4d8' }}>{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column: Lead Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(30, 30, 36, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            position: 'relative',
          }}
        >
          {/* Immediate Replies Badge */}
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              right: '24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ⚡ Immediate Replies
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>Request More Details</h2>
          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '0 0 24px' }}>
            Submit your information and our support team will set up your portfolio account immediately.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label" style={{ color: '#a1a1aa' }}>Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}
                />
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  style={{ paddingLeft: '40px', background: 'rgba(9,9,11,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <div>
              <label className="label" style={{ color: '#a1a1aa' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}
                />
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ paddingLeft: '40px', background: 'rgba(9,9,11,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <div>
              <label className="label" style={{ color: '#a1a1aa' }}>Phone Number <span style={{ fontSize: '11px', color: '#71717a' }}>(Optional)</span></label>
              <div style={{ position: 'relative' }}>
                <FiPhone
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}
                />
                <input
                  type="tel"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{ paddingLeft: '40px', background: 'rgba(9,9,11,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <div>
              <label className="label" style={{ color: '#a1a1aa' }}>Describe Your Needs</label>
              <div style={{ position: 'relative' }}>
                <FiMessageSquare
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '15px', color: '#71717a' }}
                />
                <textarea
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the portfolio sections, custom templates, or support questions you have."
                  required
                  rows={3}
                  style={{ paddingLeft: '40px', paddingTop: '12px', background: 'rgba(9,9,11,0.5)', borderColor: 'rgba(255,255,255,0.08)', resize: 'vertical' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                transition: 'transform 0.2s, opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              {submitting ? 'Sending Request...' : 'Send Inquiry Now'}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Success and Error Toasts */}
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
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
              padding: '12px 18px',
              fontSize: '14px',
              color: '#fff',
              background: '#ef4444',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(239,68,68,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FiInfo size={16} />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 900px) {
          .landing-main {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            padding: 20px 20px 60px !important;
          }
          .landing-header {
            padding: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .landing-header-buttons {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
