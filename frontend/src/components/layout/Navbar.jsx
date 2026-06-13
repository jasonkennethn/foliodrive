import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { username } = useParams();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { profile, sections } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isScrollingToRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const visibleSections = sections?.filter((s) => s.is_visible) || [];

  // Dynamic collapse: Collapse to hamburger if the width required is larger than screen size
  useEffect(() => {
    const checkCollapse = () => {
      // 110px per nav item + 280px for spacing/profile name/theme toggle
      const requiredWidth = visibleSections.length * 110 + 280;
      setIsCollapsed(window.innerWidth < requiredWidth);
    };

    checkCollapse();
    window.addEventListener('resize', checkCollapse);
    return () => window.removeEventListener('resize', checkCollapse);
  }, [visibleSections]);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (visibleSections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = parseInt(entry.target.id.replace('section-', ''));
          
          // If we are currently smooth-scrolling to a clicked link, ignore intermediate checks
          if (isScrollingToRef.current !== null) {
            if (sectionId === isScrollingToRef.current) {
              isScrollingToRef.current = null;
            }
            return;
          }
          
          setActiveSection(sectionId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    visibleSections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visibleSections]);

  const scrollToSection = (sectionId) => {
    isScrollingToRef.current = sectionId;
    setActiveSection(sectionId); // Highlight clicked link immediately!
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  const scrollToTop = () => {
    isScrollingToRef.current = 'hero';
    setActiveSection(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
    setTimeout(() => {
      isScrollingToRef.current = null;
    }, 850);
  };

  const ThemeIcon = () => {
    if (resolvedTheme === 'light') return <FiSun size={18} />;
    return <FiMoon size={18} />;
  };

  const themeLabel = resolvedTheme === 'light' ? 'Light' : 'Dark';

  const getShortTitle = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('board')) return 'Board Admin';
    if (lower.includes('governance')) return 'Governance';
    if (lower.includes('filing') || lower.includes('register')) return 'Filings';
    if (lower.includes('qualification') || lower.includes('membership') || lower.includes('credential')) return 'Credentials';
    if (lower.includes('advisory') || lower.includes('contact') || lower.includes('get in touch')) return 'Contact';
    if (lower.includes('project')) return 'Projects';
    if (lower.includes('experience')) return 'Experience';
    if (lower.includes('skill')) return 'Skills';
    if (lower.includes('about')) return 'About';
    if (lower.includes('achievement')) return 'Achievements';
    if (lower.includes('certification')) return 'Certifications';
    
    if (title.length > 15) {
      return title.slice(0, 12) + '...';
    }
    return title;
  };

  return (
    <>
      <nav
        className="glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all var(--transition-base)',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
        }}
      >
        <div
          className="container-portfolio"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: scrolled ? '56px' : '64px',
            transition: 'height var(--transition-base)',
          }}
        >
          {/* Left side: Profile name */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 0%' }}>
            <button
              onClick={scrollToTop}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-primary)',
                padding: 0,
              }}
            >
              {profile?.name || 'Portfolio'}
            </button>
          </div>

          {/* Center side: centered navigation links (only if not collapsed) */}
          {!isCollapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flex: '2 1 0%',
              }}
            >
              {visibleSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    style={{
                      position: 'relative',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'color var(--transition-fast)',
                      fontFamily: 'var(--font-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'color-mix(in srgb, var(--accent-color) 12%, transparent)',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid color-mix(in srgb, var(--accent-color) 25%, transparent)',
                          zIndex: -1,
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {getShortTitle(section.title)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right side: Actions (Theme toggle + Hamburger menu if collapsed) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              flex: '1 1 0%',
            }}
          >
            {username && profile && profile.show_ats_button !== false && (
              <a
                href={`/${username}/showcase`}
                className="btn-accent"
                style={{
                  textDecoration: 'none',
                  fontSize: '12px',
                  padding: '6px 14px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  marginRight: '4px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                ATS Resume
              </a>
            )}


            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={`Theme: ${themeLabel}`}
            >
              <motion.div
                key={resolvedTheme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ThemeIcon />
              </motion.div>
            </button>

            {isCollapsed && (
              <button
                onClick={() => setMobileOpen(true)}
                className="btn-icon"
                title="Open navigation"
              >
                <FiMenu size={20} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1001,
              }}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '280px',
                background: 'var(--bg-surface)',
                zIndex: 1002,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button onClick={() => setMobileOpen(false)} className="btn-icon">
                  <FiX size={20} />
                </button>
              </div>

              {/* Nav links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {visibleSections.map((section, idx) => {
                  return (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => scrollToSection(section.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all var(--transition-fast)',
                        fontFamily: 'var(--font-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--bg-elevated)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                      }}
                    >
                      {getShortTitle(section.title)}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to push content below fixed nav */}
      <div style={{ height: '64px' }} />
    </>
  );
}
