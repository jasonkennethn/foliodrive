import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/portfolio/HeroSection';
import SectionRenderer from '../components/portfolio/SectionRenderer';
import { FiArrowUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Portfolio() {
  const { username } = useParams();
  const { profile, sections, error, loading, refetch } = usePortfolio();

  // Fetch portfolio for username on mount or when username changes
  useEffect(() => {
    if (username) {
      refetch(username);
    }
  }, [username, refetch]);

  // Update document title
  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} — Portfolio`;
    }
  }, [profile]);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#f4f4f5',
          padding: '24px',
          textAlign: 'center',
          fontFamily: "'Outfit', 'Inter', sans-serif",
        }}
      >
        <h1 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '16px', color: '#f43f5e' }}>
          Portfolio Not Found
        </h1>
        <p style={{ fontSize: '16px', color: '#a1a1aa', maxWidth: '480px', marginBottom: '32px', lineHeight: 1.5 }}>
          The portfolio page you are trying to view for user <strong>"{username}"</strong> does not exist or has not been set up yet.
        </p>
        <a
          href="/"
          className="btn-accent"
          style={{ textDecoration: 'none', padding: '12px 28px', fontSize: '14px', borderRadius: '12px' }}
        >
          Create Your Portfolio Now
        </a>
      </div>
    );
  }

  const visibleSections = sections?.filter((s) => s.is_visible) || [];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      {visibleSections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}
      {visibleSections.length === 0 && !loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--text-muted)',
            fontSize: '16px',
          }}
        >
          No sections added yet. Visit <strong>/master-admin</strong> to start building your portfolio.
        </div>
      )}

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="back-to-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            title="Back to Top"
          >
            <FiArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
