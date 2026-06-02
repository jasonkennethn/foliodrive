import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../context/PortfolioContext';
import LoginGate from '../components/admin/LoginGate';
import ProfileEditor from '../components/admin/ProfileEditor';
import SectionManager from '../components/admin/SectionManager';
import ContentBlockEditor from '../components/admin/ContentBlockEditor';
import ThemeEditor from '../components/admin/ThemeEditor';
import {
  FiUser, FiLayers, FiDroplet, FiLogOut, FiExternalLink,
  FiMenu, FiX, FiFileText,
} from 'react-icons/fi';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'sections', label: 'Sections', icon: FiLayers },
  { id: 'theme', label: 'Theme', icon: FiDroplet },
];

export default function MasterAdmin() {
  const { isAuthenticated, isStaff, username, logout } = useAuth();
  const { refetch } = usePortfolio();
  const [authed, setAuthed] = useState(isAuthenticated && isStaff);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = 'Admin Panel — Portfolio';
    if (authed) {
      refetch();
    }
  }, [authed, refetch]);

  if (!authed) {
    return <LoginGate onAuthenticated={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  const handleChanged = () => {
    refetch();
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setActiveTab('section-detail');
    setSidebarOpen(false);
  };

  const handleBackFromSection = () => {
    setSelectedSection(null);
    setActiveTab('sections');
  };

  const renderContent = () => {
    if (activeTab === 'section-detail' && selectedSection) {
      return (
        <ContentBlockEditor
          section={selectedSection}
          onBack={handleBackFromSection}
          onChanged={handleChanged}
        />
      );
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileEditor onSaved={handleChanged} />;
      case 'sections':
        return (
          <SectionManager
            onSectionSelect={handleSectionSelect}
            onChanged={handleChanged}
          />
        );
      case 'theme':
        return <ThemeEditor onChanged={handleChanged} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      {/* Mobile/Tablet header */}
      <div
        className="admin-mobile-header glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 100,
        }}
      >
        <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
          Admin Panel
        </span>
        <button className="btn-icon" onClick={handleLogout}>
          <FiLogOut size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '260px',
            flexShrink: 0,
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: sidebarOpen ? 0 : '-260px',
            bottom: 0,
            zIndex: 99,
            transition: 'left var(--transition-base)',
          }}
          className="admin-sidebar glass"
        >
          {/* Branding */}
          <div style={{ marginBottom: '32px', paddingTop: '8px' }}>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Admin Panel
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Manage your portfolio
            </p>
          </div>

          {/* Nav items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'sections' && activeTab === 'section-detail');
              return (
                <button
                  key={tab.id}
                  className={`admin-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'sections') setSelectedSection(null);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-sidebar-item"
              style={{ textDecoration: 'none' }}
            >
              <FiExternalLink size={18} />
              View Portfolio
            </a>
            <a
              href={`/${username}/showcase`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-sidebar-item"
              style={{ textDecoration: 'none' }}
            >
              <FiFileText size={18} />
              ATS Resume
            </a>
            <button className="admin-sidebar-item" onClick={handleLogout}>
              <FiLogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Desktop sidebar spacer */}
        <div className="admin-sidebar-spacer" />

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: '32px',
            paddingTop: '32px',
            maxWidth: '900px',
          }}
          className="admin-main-content"
        >
          <motion.div
            key={activeTab + (selectedSection?.id || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="glass"
            style={{
              padding: 'clamp(16px, 4vw, 32px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--glass-bg)',
            }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 98,
          }}
        />
      )}

      {/* Responsive layout styles */}
      <style>{`
        @media (min-width: 1025px) {
          .admin-sidebar {
            left: 0 !important;
          }
          .admin-sidebar-spacer {
            width: 260px;
            flex-shrink: 0;
            display: block !important;
          }
          .admin-mobile-header {
            display: none !important;
          }
          .admin-mobile-backdrop {
            display: none !important;
          }
          .admin-main-content {
            padding-top: 32px !important;
          }
        }
        @media (max-width: 1024px) {
          .admin-sidebar-spacer {
            display: none !important;
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-mobile-backdrop {
            display: block !important;
          }
          .admin-main-content {
            padding: 24px !important;
            padding-top: 80px !important;
          }
        }
        @media (max-width: 768px) {
          .admin-main-content {
            padding: 16px !important;
            padding-top: 72px !important;
          }
        }
      `}</style>
    </div>
  );
}
