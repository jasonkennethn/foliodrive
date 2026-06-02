import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../hooks/useAuth';
import { FiFileText, FiPrinter, FiDownload, FiArrowLeft } from 'react-icons/fi';

export default function ShowcaseResume() {
  const { username: paramUsername } = useParams();
  const { username: authUsername, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const activeUsername = paramUsername || authUsername;
  const { profile, sections, error, loading, refetch } = usePortfolio();

  useEffect(() => {
    if (activeUsername) {
      refetch(activeUsername);
    } else {
      // If no username is provided and not logged in, redirect to home page
      if (!loading && !isAuthenticated) {
        navigate('/');
      }
    }
  }, [activeUsername, refetch, isAuthenticated, loading, navigate]);

  // Set document title
  useEffect(() => {
    if (profile?.name) {
      document.title = `Resume — ${profile.name}`;
    }
  }, [profile]);

  // Export to Word (doc format)
  const handleDownloadWord = () => {
    const resumeElement = document.getElementById('ats-resume-document');
    if (!resumeElement) return;

    const content = resumeElement.innerHTML;
    
    // Word document HTML container setup
    const header = 
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head>" +
      "<title>Resume - " + (profile?.name || 'User') + "</title>" +
      "<style>" +
      "body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #111111; padding: 0.75in; }" +
      "h1 { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 4pt; margin-top: 0; }" +
      "h2 { font-size: 13pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #111111; padding-bottom: 2pt; margin-top: 18pt; margin-bottom: 8pt; }" +
      "h3 { font-size: 11pt; font-weight: bold; margin-top: 6pt; margin-bottom: 2pt; }" +
      "p { margin: 0 0 6pt 0; }" +
      "ul { margin: 0 0 6pt 20pt; padding: 0; }" +
      "li { margin-bottom: 3pt; }" +
      ".contact-info { text-align: center; font-size: 9.5pt; color: #444444; margin-bottom: 16pt; }" +
      ".block-header { font-weight: bold; display: flex; justify-content: space-between; }" +
      ".block-date { font-weight: normal; color: #444444; }" +
      ".tag-badge { background: #f4f4f5; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-right: 4px; margin-bottom: 4px; }" +
      "</style>" +
      "</head>" +
      "<body>";
    const footer = "</body></html>";
    
    const combinedHTML = header + content + footer;
    const blob = new Blob(['\ufeff' + combinedHTML], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = url;
    downloadLink.download = `${profile?.name?.replace(/\s+/g, '_') || 'User'}_Resume.doc`;
    downloadLink.click();
    
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  // Export to PDF via Print window
  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifycontent: 'center', background: '#f4f4f5' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e4e4e7', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f4f5', padding: '24px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ef4444', fontSize: '28px', marginBottom: '12px' }}>Resume Not Found</h1>
        <p style={{ color: '#71717a', marginBottom: '24px' }}>Could not load portfolio data for this user. Please ensure they have configured a profile.</p>
        <Link to="/" style={{ textDecoration: 'none', background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: '8px' }}>Go Home</Link>
      </div>
    );
  }

  // Group blocks by section
  const visibleSections = sections?.filter(s => s.is_visible) || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f4f5',
        color: '#18181b',
        fontFamily: "'Inter', sans-serif",
        paddingBottom: '60px',
      }}
      className="ats-showcase-container"
    >
      {/* Control bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          borderBottom: '1px solid #e4e4e7',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
        className="ats-control-bar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(activeUsername ? `/${activeUsername}` : '/')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#71717a',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f4f4f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiArrowLeft />
            Back to Site
          </button>
          <span style={{ height: '20px', width: '1px', background: '#e4e4e7' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFileText size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700, fontSize: '15px' }}>ATS Resume Showcase</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDownloadWord}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              background: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              color: '#3f3f46',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#d4d4d8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e4e4e7'; }}
          >
            <FiDownload />
            Download Word
          </button>
          
          <button
            onClick={handlePrintPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#6366f1',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(99,102,241,0.2)',
              transition: 'transform 0.1s, opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <FiPrinter />
            Download PDF
          </button>
        </div>
      </header>

      {/* Page Content area */}
      <div style={{ maxWidth: '850px', margin: '40px auto 0', padding: '0 20px' }}>
        <div
          style={{
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04), 0 1px 8px rgba(0,0,0,0.02)',
            border: '1px solid #e4e4e7',
            borderRadius: '8px',
            padding: 'clamp(20px, 6vw, 56px)',
            minHeight: '297mm', // A4 aspect placeholder
            width: '100%',
            boxSizing: 'border-box',
          }}
          className="ats-resume-paper"
        >
          {/* ATS Document (Exportable & Printable Content) */}
          <div id="ats-resume-document" style={{ color: '#111111', fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: '14px', lineHeight: '1.45' }}>
            
            {/* Header / Contacts */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#111111', textTransform: 'none', letterSpacing: '-0.02em' }}>
                {profile.name}
              </h1>
              <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', marginTop: '6px' }}>
                {profile.role && <span style={{ fontWeight: 'bold' }}>{profile.role}</span>}
                {profile.location && <span>• {profile.location}</span>}
                {profile.email && <span>• {profile.email}</span>}
                {activeUsername && <span>• {window.location.host}/{activeUsername}</span>}
              </div>
              
              {/* Tagline / Professional Subtitle */}
              {profile.tagline && (
                <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#374151', marginTop: '10px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', lineHeight: '1.4' }}>
                  "{profile.tagline}"
                </p>
              )}
            </div>

            {/* Profile Bio / Executive Summary */}
            {profile.bio && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111111', paddingBottom: '3px', margin: '18px 0 8px 0', color: '#111111' }}>
                  Professional Summary
                </h2>
                <p style={{ margin: '0', textAlign: 'justify', fontSize: '13.5px', color: '#27272a' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Sections Loop */}
            {visibleSections.map(section => (
              <div key={section.id} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111111', paddingBottom: '3px', margin: '18px 0 8px 0', color: '#111111' }}>
                  {section.title}
                </h2>
                
                {/* Section Blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {section.blocks?.map(block => {
                    if (block.block_type === 'skills') {
                      const tagsArray = block.tags ? block.tags.split(',').map(t => t.trim()) : [];
                      return (
                        <div key={block.id} style={{ margin: '0' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {tagsArray.map((tag, idx) => (
                              <span key={idx} style={{ background: '#f4f4f5', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', color: '#18181b', border: '1px solid #e4e4e7', display: 'inline-block' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    if (block.block_type === 'paragraph') {
                      return (
                        <div key={block.id} style={{ margin: '0' }}>
                          <p style={{ margin: '0', fontSize: '13.5px', color: '#27272a', textAlign: 'justify' }}>
                            {block.text}
                          </p>
                        </div>
                      );
                    }

                    // Card or Timeline
                    const showHeader = block.title || block.timeline_date;
                    return (
                      <div key={block.id} style={{ margin: '0', pageBreakInside: 'avoid' }}>
                        {showHeader && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0', color: '#111111' }}>
                              {block.title || block.timeline_title}
                            </h3>
                            {(block.timeline_date) && (
                              <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'normal' }}>
                                {block.timeline_date}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Block Description */}
                        {block.description && (
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#27272a', textAlign: 'justify', whiteSpace: 'pre-line' }}>
                            {block.description}
                          </p>
                        )}

                        {/* Block Description from timeline template */}
                        {block.timeline_description && (
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#27272a', textAlign: 'justify', whiteSpace: 'pre-line' }}>
                            {block.timeline_description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Print Specific CSS Style Rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .ats-showcase-container {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .ats-control-bar {
            display: none !important;
          }
          .ats-resume-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }
          #ats-resume-document {
            font-size: 11pt !important;
            line-height: 1.4 !important;
          }
          #ats-resume-document h1 {
            font-size: 20pt !important;
          }
          #ats-resume-document h2 {
            font-size: 13pt !important;
            border-bottom: 1px solid #000000 !important;
          }
          #ats-resume-document h3 {
            font-size: 11pt !important;
          }
        }
      `}} />
    </div>
  );
}
