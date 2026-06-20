import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/portfolio/HeroSection';
import SectionRenderer from '../components/portfolio/SectionRenderer';
import CustomizerPanel from '../components/portfolio/CustomizerPanel';
import api from '../api/axiosConfig';
import { FiArrowUp, FiArrowDown, FiEye, FiEyeOff, FiGrid, FiCheck, FiSliders, FiFolder } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../components/layout/PageLoader';
import ErrorCardPage from '../components/layout/ErrorCardPage';

export default function Portfolio() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, sections, error, loading, refetch } = usePortfolio();
  const { isAuthenticated, username: loggedInUser } = useAuth();
  
  const editMode = searchParams.get('edit') === 'true';
  const isOwner = isAuthenticated && loggedInUser && loggedInUser.toLowerCase() === username?.toLowerCase();

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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

  const handleDragStart = (e, index) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const updatedSections = [...sectionsToRender];
    const [draggedItem] = updatedSections.splice(draggingIndex, 1);
    updatedSections.splice(targetIndex, 0, draggedItem);

    // Save order
    const newOrderIds = updatedSections.map(s => s.id);
    try {
      await api.patch('/sections/reorder/', { order: newOrderIds });
      refetch(username);
    } catch (err) {
      console.error('Failed to reorder sections:', err);
    }
  };

  const handleShiftSection = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionsToRender.length) return;

    const updatedSections = [...sectionsToRender];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[targetIndex];
    updatedSections[targetIndex] = temp;

    const newOrderIds = updatedSections.map(s => s.id);
    try {
      await api.patch('/sections/reorder/', { order: newOrderIds });
      refetch(username);
    } catch (err) {
      console.error('Failed to shift section:', err);
    }
  };

  const handleToggleVisibility = async (sectionId, currentVisibility) => {
    try {
      await api.patch(`/sections/${sectionId}/`, { is_visible: !currentVisibility });
      refetch(username);
    } catch (err) {
      console.error('Failed to toggle section visibility:', err);
    }
  };

  const handleRenameTitle = async (sectionId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await api.patch(`/sections/${sectionId}/`, { title: newTitle.trim() });
      refetch(username);
    } catch (err) {
      console.error('Failed to rename section:', err);
    }
  };

  if (loading) {
    return <PageLoader message="Retrieving Portfolio..." />;
  }

  if (error) {
    if (error.blocked) {
      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.08) 0%, transparent 45%),
                        radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.05) 0%, transparent 45%),
                        #0f172a`,
            fontFamily: 'var(--font-primary)',
            color: '#f8fafc',
            padding: '24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              padding: '40px 32px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div 
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Access Suspended
              </h1>
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.5 }}>
                This portfolio website is currently inactive. The allocated subscription or trial period has ended, or access has been restricted by the system administrator.
              </p>
            </div>

            {error.reason && (
              <div 
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#fca5a5',
                  fontWeight: 500,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', color: '#ef4444' }}>
                  Reason for Suspension:
                </span>
                {error.reason}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '8px' }}>
              <a 
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  background: '#3b82f6',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                Create Your Portfolio
              </a>
              <button 
                onClick={() => window.history.back()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#94a3b8';
                  e.target.style.background = 'transparent';
                }}
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <ErrorCardPage
        errorCode="PORTFOLIO ERROR"
        title="Portfolio Not Found"
        description={`The portfolio page for user "${username}" does not exist or has not been configured yet.`}
        primaryButtonText="Create Your Portfolio"
        primaryButtonAction="/"
        secondaryButtonText="Go Back"
        secondaryButtonAction={-1}
      />
    );
  }

  const sectionsToRender = isOwner && editMode ? (sections || []) : (sections?.filter((s) => s.is_visible) || []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: isOwner && editMode ? '50px' : '0' }}>
      {/* Edit Mode Top Toolbar */}
      {isOwner && editMode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '50px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            fontFamily: 'var(--font-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--accent-color)',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Edit Mode Active
            </span>
            <style>{`
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.5; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.5; }
              }
            `}</style>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-ghost"
              onClick={() => setShowCustomizer(true)}
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiSliders size={14} />
              Customize Design
            </button>
            <a
              href="/master-admin"
              className="btn-ghost"
              style={{ textDecoration: 'none', fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiFolder size={14} />
              Dashboard
            </a>
            <button
              className="btn-accent"
              onClick={() => {
                setSearchParams({});
              }}
              style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiCheck size={14} />
              Done Editing
            </button>
          </div>
        </div>
      )}

      <Navbar />
      <HeroSection />

      {/* Render Sections */}
      {sectionsToRender.map((section, index) => {
        const isDragging = index === draggingIndex;
        const isDragOver = index === dragOverIndex;

        if (isOwner && editMode) {
          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                position: 'relative',
                border: isDragOver ? '2px dashed var(--accent-color)' : '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                margin: '32px 16px',
                padding: '24px 16px',
                background: isDragOver 
                  ? 'color-mix(in srgb, var(--accent-color) 4%, transparent)' 
                  : 'color-mix(in srgb, var(--bg-surface) 96%, transparent)',
                opacity: isDragging ? 0.4 : (section.is_visible ? 1 : 0.65),
                transition: 'all var(--transition-fast)',
                transform: isDragOver ? 'scale(1.005)' : 'none',
              }}
            >
              {/* Section Control Panel Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '-16px',
                  right: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 10,
                }}
              >
                {/* Drag Handle */}
                <div
                  style={{
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    color: 'var(--text-muted)',
                  }}
                  title="Drag to reorder"
                >
                  <FiGrid size={14} />
                </div>

                <span style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />

                {/* Visibility Toggle */}
                <button
                  onClick={() => handleToggleVisibility(section.id, section.is_visible)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: section.is_visible ? 'var(--accent-color)' : 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={section.is_visible ? 'Hide section' : 'Show section'}
                >
                  {section.is_visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                </button>

                <span style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />

                {/* Move Up */}
                <button
                  disabled={index === 0}
                  onClick={() => handleShiftSection(index, 'up')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    color: index === 0 ? 'var(--border-color)' : 'var(--text-primary)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Move Up"
                >
                  <FiArrowUp size={14} />
                </button>

                {/* Move Down */}
                <button
                  disabled={index === sectionsToRender.length - 1}
                  onClick={() => handleShiftSection(index, 'down')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: index === sectionsToRender.length - 1 ? 'not-allowed' : 'pointer',
                    color: index === sectionsToRender.length - 1 ? 'var(--border-color)' : 'var(--text-primary)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Move Down"
                >
                  <FiArrowDown size={14} />
                </button>
              </div>

              {!section.is_visible && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'var(--bg-elevated)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  Hidden from public
                </div>
              )}

              <SectionRenderer 
                section={section} 
                index={index} 
                isEditing={true}
                onRenameTitle={(newTitle) => handleRenameTitle(section.id, newTitle)}
              />
            </div>
          );
        }

        return <SectionRenderer key={section.id} section={section} index={index} />;
      })}

      {sectionsToRender.length === 0 && !loading && (
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

      {/* Theme Customizer sliding drawer */}
      <CustomizerPanel 
        isOpen={showCustomizer} 
        onClose={() => setShowCustomizer(false)} 
      />

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
