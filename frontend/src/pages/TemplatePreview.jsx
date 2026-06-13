import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowLeft, LuShoppingCart, LuCheck, LuEye, LuPalette, LuSmartphone, LuSparkles } from 'react-icons/lu';
import ErrorCardPage from '../components/layout/ErrorCardPage';

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const C = {
  bg: '#09090b', bgSubtle: '#0f1117', surface: '#141820', surfaceHover: '#1a1f2e',
  text: '#f0f2f5', textSecondary: '#94a3b8', textMuted: '#64748b',
  accent: '#818cf8', accentBright: '#a5b4fc', accentDark: '#6366f1',
  accentGlow: 'rgba(129,140,248,0.15)', accentGlowStrong: 'rgba(129,140,248,0.25)',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(255,255,255,0.12)', borderAccent: 'rgba(129,140,248,0.3)',
  success: '#34d399',
};

const TEMPLATE_DATA = {
  'minimal-pro': {
    name: 'Minimal Pro', category: 'Software Engineer',
    colors: ['#1e293b', '#334155'], accent: '#34d399',
    description: 'A clean, minimalist portfolio design built for software engineers who want their work to speak louder than their design. Perfect for showcasing code projects, open source contributions, and technical skills.',
    features: ['Clean minimalist layout', 'Code project showcase section', 'GitHub integration ready', 'Dark/Light mode support', 'Responsive on all devices', 'SEO optimized'],
  },
  'creative-studio': {
    name: 'Creative Studio', category: 'UI/UX Designer',
    colors: ['#4c1d95', '#6d28d9'], accent: '#f472b6',
    description: 'A vibrant, expressive portfolio template crafted for designers, artists, and creatives. Showcase your work with stunning visual layouts and immersive gallery sections.',
    features: ['Full-screen gallery', 'Masonry grid layout', 'Animated transitions', 'Custom typography', 'Color theming options', 'Client testimonials section', 'Case study pages', 'Behance/Dribbble integration'],
  },
  'corporate-elite': {
    name: 'Corporate Elite', category: 'Product Manager',
    colors: ['#1e3a5f', '#1e40af'], accent: '#60a5fa',
    description: 'A sophisticated, professional portfolio template designed for business professionals, consultants, and executives. Make a powerful first impression with a polished corporate aesthetic.',
    features: ['Professional layout', 'Services showcase', 'Client logo section', 'Testimonials carousel', 'Contact form integration', 'LinkedIn integration', 'Blog section', 'Achievement timeline'],
  },
  'tech-innovator': {
    name: 'Tech Innovator', category: 'Data Scientist',
    colors: ['#312e81', '#4338ca'], accent: '#a78bfa',
    description: 'The ultimate portfolio template for engineers and tech professionals. Feature your projects with interactive demos, detailed case studies, and comprehensive skill visualizations.',
    features: ['Interactive project demos', 'Skill progress visualizations', 'Tech stack showcase', 'Blog with code highlighting', 'API integration ready', 'Advanced analytics dashboard', 'Priority support included', 'ATS-friendly resume builder', 'Remove branding'],
  },
  'digital-canvas': {
    name: 'Digital Canvas', category: 'Content Creator',
    colors: ['#7f1d1d', '#b91c1c'], accent: '#fbbf24',
    description: 'A vibrant, media-focused portfolio template built for content creators, influencers, and digital artists. Highlight videos, blog posts, social feeds, and creative projects in a dynamic layout.',
    features: ['Social media integrations', 'Video showcase gallery', 'Interactive blog system', 'Newsletter subscription card', 'Custom branding tools', 'Responsive layouts'],
  },
  'developer-hub': {
    name: 'Developer Hub', category: 'Full Stack Developer',
    colors: ['#064e3b', '#047857'], accent: '#6ee7b7',
    description: 'A comprehensive, technical portfolio template designed for full-stack developers. Showcase frontend designs alongside backend architecture diagrams, API documentation, and code repositories.',
    features: ['Interactive architecture viewer', 'API documentation builder', 'GitHub stats integration ready', 'Project live-demo frames', 'Dark mode default styling', 'SEO & performance optimized'],
  },
};

export default function TemplatePreview() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATE_DATA[templateId];
  useEffect(() => {
    if (template) {
      document.title = `${template.name} Template Preview — FolioDrive`;
    }
  }, [template]);

  if (!template) {
    return (
      <ErrorCardPage
        errorCode="TEMPLATE ERROR"
        title="Template Not Found"
        description={`The template "${templateId}" you are trying to preview does not exist.`}
        primaryButtonText="Back to Templates"
        primaryButtonAction="/#templates"
        secondaryButtonText="Go to Homepage"
        secondaryButtonAction="/"
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FONT, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        .purchase-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px ${C.accentGlowStrong}, 0 0 60px ${C.accentGlow} !important; }
        .back-btn:hover { background: ${C.surface} !important; border-color: ${C.accent} !important; }
        ::selection { background: ${C.accentDark}; color: #fff; }
        .preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .preview-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>

      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', height: 64, justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/#templates')} className="back-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 16px', color: C.text, fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s' }}>
            <LuArrowLeft size={16} /> Back to Templates
          </button>
          <a href="/#pricing" className="purchase-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, fontFamily: FONT, color: '#fff', background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`, border: 'none', borderRadius: 12, cursor: 'pointer', textDecoration: 'none', boxShadow: `0 4px 20px ${C.accentGlow}`, transition: 'all 0.3s' }}>
            Choose a Plan
          </a>
        </div>
      </header>

      {/* Hero preview */}
      <section style={{ padding: '60px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="preview-grid">

            {/* Template Preview Card */}
            <div style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '3/4', borderRadius: 24, overflow: 'hidden', boxShadow: `0 40px 100px rgba(0,0,0,0.4), 0 0 60px ${C.accentGlow}`, border: `1px solid ${C.border}` }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})` }} />
                {/* Wireframe content */}
                <div style={{ position: 'absolute', inset: 0, padding: 32, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: template.accent }} />
                    <div>
                      <div style={{ height: 10, width: 100, background: 'rgba(255,255,255,0.3)', borderRadius: 5, marginBottom: 8 }} />
                      <div style={{ height: 7, width: 70, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ height: 10, width: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: 5 }} />
                    <div style={{ height: 10, width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: 5 }} />
                    <div style={{ height: 10, width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: 5 }} />
                    <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{ aspectRatio: '16/10', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                    <div style={{ height: 36, flex: 1, background: template.accent, borderRadius: 8, opacity: 0.8 }} />
                    <div style={{ height: 36, flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 100, background: C.accentGlow, border: `1px solid ${C.borderAccent}`, marginBottom: 20 }}>
                <LuSparkles size={12} style={{ color: C.accent }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.accentBright }}>{template.category} Template</span>
              </div>

              <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, marginBottom: 12, letterSpacing: '-0.02em' }}>{template.name}</h1>
              <p style={{ fontSize: 17, color: C.textSecondary, lineHeight: 1.7, marginBottom: 32 }}>{template.description}</p>

              {/* Price / Inclusion Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.success, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LuCheck size={14} /> Included in all plans
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.text }}>Unlock with any Plan</span>
                <span style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.5 }}>Get full access to this template and customize it by choosing any plan starting at ₹300.</span>
              </div>

              {/* Features */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>What's included</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                {template.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LuCheck size={16} style={{ color: C.success, flexShrink: 0 }} />
                    <span style={{ color: C.textSecondary, fontSize: 15 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <a href="/#pricing" className="purchase-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', fontSize: 16, fontWeight: 700, fontFamily: FONT, color: '#fff', background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`, border: 'none', borderRadius: 14, cursor: 'pointer', textDecoration: 'none', boxShadow: `0 4px 20px ${C.accentGlow}, 0 0 40px ${C.accentGlow}`, transition: 'all 0.3s' }}>
                  Choose a Plan to Unlock
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick info cards */}
      <section style={{ padding: '0 0 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: LuPalette, title: 'Fully Customizable', desc: 'Change colors, fonts, layout — make it yours' },
              { icon: LuSmartphone, title: 'Responsive Design', desc: 'Looks stunning on desktop, tablet, and mobile' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <Icon size={24} style={{ color: C.accent, marginBottom: 12 }} />
                <h4 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
