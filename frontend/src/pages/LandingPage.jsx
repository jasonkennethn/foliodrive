import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  LuMenu, LuX, LuArrowRight, LuSparkles, LuFileText,
  LuPalette, LuZap, LuShield, LuChartColumn, LuCircleCheck,
  LuCheck, LuMail, LuUser, LuMessageSquare, LuInfo,
  LuStar, LuLock, LuChevronUp,
  LuMic, LuVolume2, LuVolumeX, LuSend, LuExternalLink
} from 'react-icons/lu';
import api from '../api/axiosConfig';

/* ═══════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Self-contained tokens (no Tailwind dependency)
   ═══════════════════════════════════════════════════════════════════ */
const C = {
  // Core palette
  bg: '#09090b',
  bgSubtle: '#0f1117',
  surface: '#141820',
  surfaceHover: '#1a1f2e',
  elevated: '#1e2433',
  // Text
  text: '#f0f2f5',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  // Accent — vibrant indigo
  accent: '#818cf8',
  accentBright: '#a5b4fc',
  accentDark: '#6366f1',
  accentGlow: 'rgba(129,140,248,0.15)',
  accentGlowStrong: 'rgba(129,140,248,0.25)',
  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
  borderAccent: 'rgba(129,140,248,0.3)',
  // Misc
  success: '#34d399',
  error: '#f87171',
  white: '#ffffff',
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/* ═══════════════════════════════════════════════════════════════════
   MIMI AI CHAT HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const generateMimiResponse = (query) => {
  const q = query.toLowerCase().trim();
  
  const isGreeting = /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo)\b/.test(q);
  const isTemplate = /\b(template|templates|design|designs|minimal|creative|corporate|innovator|canvas|hub|role|secretary|engineer|designer)\b/.test(q);
  const isPricing = /\b(price|pricing|plan|plans|cost|costs|subscription|starter|professional|premium|rs|300|580|890|amount|free|enterprise)\b/.test(q);
  const isPayment = /\b(pay|payment|payment method|payment process|checkout|qr|qr code|upi|screenshot|promo|promo code|welcome100|folio50|promo|address)\b/.test(q);
  const isCustomization = /\b(edit|customize|customization|drag|drop|reorder|visibility|font|fonts|color|colors|theme|inline|rename|admin|master)\b/.test(q);
  const isContact = /\b(contact|email|support|help|owner|creators|outlook)\b/.test(q);
  const isAbout = /\b(about|what is|how to|foliodrive|resume|builder|portfolio|app|application)\b/.test(q);
  
  if (isGreeting) {
    return "Hello! I am MIMI, your FolioDrive assistant. Ask me anything about our application features, plans, pricing, or templates!";
  }
  if (/\b(domain|custom domain|dns|ssl)\b/.test(q)) {
    return "Custom domain support is not supported by FolioDrive. All users publish their portfolios under a premium personal subdomain (e.g. yourname.foliodrive.in).";
  }
  if (isTemplate) {
    return "FolioDrive has 6 professionally designed templates tailored for famous roles: Minimal Pro (Software Engineer), Creative Studio (UI/UX Designer), Corporate Elite (Product Manager), Tech Innovator (Data Scientist), Digital Canvas (Content Creator), and Developer Hub (Full Stack Developer). All templates are included in all of our pricing plans!";
  }
  if (isPricing) {
    return "We have three one-time payment options: Starter (₹300), Professional (₹580), and Premium (₹890). There are no monthly fees. Lifetime access is included with every purchase!";
  }
  if (isPayment) {
    return "To make a payment, click on any plan's CTA in the Pricing section. In Step 1, enter your Name, Email, Username, and Address, and apply any promo codes (e.g. WELCOME100 or FOLIO50). In Step 2, scan the UPI QR code to make payment, upload a screenshot of your payment, and submit. Your account will be verified and set up within 24 hours!";
  }
  if (isCustomization) {
    return "Our editing system is extremely rich! When logged in, click 'Customize Portfolio' or add '?edit=true' to your portfolio URL to open the sidebar. You can drag and drop sections to reorder, toggle visibility, edit section titles inline, change colors, fonts, and dark/light modes on the fly!";
  }
  if (isContact) {
    return "For queries, support, or manual assistance, you can email us directly at bringmyfolio@outlook.com. We usually respond within a few hours!";
  }
  if (isAbout) {
    return "FolioDrive is a premium portfolio and ATS-friendly resume builder. It allows professionals to select beautiful templates, customize their pages in real time via our editor, export ATS-ready resumes, and host their public portfolios under professional subdomains.";
  }
  
  return "I'm sorry, I can only assist with questions about FolioDrive (features, plans, payments, templates, and editor). Please ask me a question related to FolioDrive!";
};

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#samples', label: 'Samples' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

const SAMPLES = [
  {
    name: "Alex Rivera",
    role: "Senior Full Stack Engineer",
    username: "alex",
    description: "Modern minimalist portfolio showcasing production-grade distributed systems and frontend design.",
    colors: ["#3b82f6", "#1d4ed8"],
    accent: "#60a5fa",
    skills: ["React", "Go", "Docker", "AWS"],
    avatar: "AR"
  },
  {
    name: "Sophia Chen",
    role: "Product Designer & Illustrator",
    username: "sophia",
    description: "Immersive portfolio highlighting product strategy, visual design, and interactive mobile apps.",
    colors: ["#ec4899", "#be185d"],
    accent: "#f472b6",
    skills: ["Figma", "UI/UX", "WebGL", "Branding"],
    avatar: "SC"
  },
  {
    name: "Marcus Vance",
    role: "DevOps & Cloud Architect",
    username: "marcus",
    description: "Grid-based clean layout displaying cloud deployments, Kubernetes config, and automation pipelines.",
    colors: ["#10b981", "#047857"],
    accent: "#34d399",
    skills: ["Kubernetes", "Terraform", "CI/CD", "Python"],
    avatar: "MV"
  }
];

const FEATURES = [
  {
    icon: LuFileText,
    title: 'ATS-Friendly Resume Builder',
    description: 'Create resumes that pass through Applicant Tracking Systems with optimized templates.',
    highlights: ['Keyword optimization', 'Clean formatting', 'Multiple formats'],
    gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
  },
  {
    icon: LuPalette,
    title: 'Fully Customizable Designs',
    description: 'Customize every element to match your personal brand. Make your portfolio truly unique.',
    highlights: ['Custom colors', 'Typography options', 'Layout flexibility'],
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
  },
  {
    icon: LuZap,
    title: 'Lightning Fast Performance',
    description: 'Your portfolio loads instantly with our optimized infrastructure. Speed matters.',
    highlights: ['99.9% uptime', 'Global CDN', 'Instant loading'],
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  {
    icon: LuShield,
    title: 'Privacy & Security',
    description: 'Your data is protected with enterprise-grade security. Control your privacy.',
    highlights: ['Data encryption', 'Privacy controls', 'GDPR compliant'],
    gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
  },
  {
    icon: LuChartColumn,
    title: 'Analytics & Insights',
    description: 'Track who views your portfolio and resume. Get insights to improve your strategy.',
    highlights: ['View tracking', 'Recruiter insights', 'Performance metrics'],
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  },
];

const TEMPLATES = [
  { id: 'minimal-pro', name: 'Minimal Pro', category: 'Software Engineer', colors: ['#1e293b', '#334155'], accent: '#34d399' },
  { id: 'creative-studio', name: 'Creative Studio', category: 'UI/UX Designer', colors: ['#4c1d95', '#6d28d9'], accent: '#f472b6' },
  { id: 'corporate-elite', name: 'Corporate Elite', category: 'Product Manager', colors: ['#1e3a5f', '#1e40af'], accent: '#60a5fa' },
  { id: 'tech-innovator', name: 'Tech Innovator', category: 'Data Scientist', colors: ['#312e81', '#4338ca'], accent: '#a78bfa' },
  { id: 'digital-canvas', name: 'Digital Canvas', category: 'Content Creator', colors: ['#7f1d1d', '#b91c1c'], accent: '#fbbf24' },
  { id: 'developer-hub', name: 'Developer Hub', category: 'Full Stack Developer', colors: ['#064e3b', '#047857'], accent: '#6ee7b7' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹300',
    period: 'one-time',
    description: 'Perfect for getting started',
    features: ['Basic templates', 'FolioDrive subdomain', 'Basic analytics', 'Community support', 'Mobile responsive'],
    cta: 'Get Starter',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '₹580',
    period: 'one-time',
    description: 'Everything to land your dream job',
    features: ['All premium templates', 'ATS-friendly resume', 'Advanced analytics', 'Priority support', 'Remove branding', 'Export to PDF'],
    cta: 'Get Professional',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹890',
    period: 'one-time',
    description: 'The ultimate portfolio experience',
    features: ['All premium templates', 'ATS-friendly resume', 'Advanced analytics dashboard', 'Priority support', 'Remove branding', 'Export to PDF', 'Custom branding', 'Dedicated account manager'],
    cta: 'Get Premium',
    popular: false,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 500);
      const sections = NAV_LINKS.map((l) => l.href.slice(1));
      const pos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= pos) { setActiveSection(sections[i]); return; }
      }
      setActiveSection('');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  /* ─── Shared Styles ───────────────────────────────── */
  const sectionPadding = { padding: '120px 0' };
  const container = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' };
  const sectionLabel = { color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 };
  const sectionTitle = { color: C.text, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' };
  const sectionDesc = { color: C.textSecondary, fontSize: 18, lineHeight: 1.7, maxWidth: 600, margin: '0 auto' };

  const inputStyle = {
    width: '100%', padding: '12px 16px 12px 44px', fontSize: 14, fontFamily: FONT,
    color: C.text, background: C.bgSubtle, border: `1px solid ${C.border}`,
    borderRadius: 12, outline: 'none', transition: 'all 0.2s',
  };

  const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: FONT,
    color: '#fff', background: `linear-gradient(135deg, ${C.accentDark} 0%, ${C.accent} 100%)`,
    border: 'none', borderRadius: 14, cursor: 'pointer', textDecoration: 'none',
    boxShadow: `0 4px 20px ${C.accentGlow}, 0 0 40px ${C.accentGlow}`,
    transition: 'all 0.3s', letterSpacing: '0.01em',
  };

  const btnOutline = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: FONT,
    color: C.text, background: 'transparent',
    border: `1px solid ${C.borderHover}`, borderRadius: 14, cursor: 'pointer',
    transition: 'all 0.3s', textDecoration: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FONT, WebkitFontSmoothing: 'antialiased', overflowX: 'hidden' }}>

      {/* ═══ CSS Keyframes (injected once) ═══ */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .landing-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentGlow} !important; }
        .landing-card:hover { border-color: ${C.borderAccent} !important; transform: translateY(-4px) !important; box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 30px ${C.accentGlow} !important; }
        .template-card:hover .template-overlay { opacity: 1 !important; }
        .pricing-card:hover { border-color: ${C.borderAccent} !important; transform: translateY(-6px) !important; }
        .nav-link:hover { color: ${C.text} !important; }
        .btn-primary-hover:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px ${C.accentGlowStrong}, 0 0 60px ${C.accentGlow} !important; }
        .btn-outline-hover:hover { background: ${C.surface} !important; border-color: ${C.accent} !important; }
        .stat-card:hover { background: ${C.surface} !important; border-color: ${C.borderAccent} !important; }
        ::selection { background: ${C.accentDark}; color: #fff; }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(9,9,11,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <nav style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="url(#logo-grad)"/>
                <path d="M10 11h12v2.5H13v3.5h8v2.5h-8v5.5H10V11z" fill="#fff"/>
                <path d="M23 18.5l4 4-4 4" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                <defs><linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
              </svg>
            </div>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>FolioDrive</span>
          </a>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hide-mobile">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href.slice(1))}
                className="nav-link"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT,
                  fontSize: 14, fontWeight: 500,
                  color: activeSection === link.href.slice(1) ? C.text : C.textMuted,
                  transition: 'color 0.2s', padding: '4px 0',
                  borderBottom: activeSection === link.href.slice(1) ? `2px solid ${C.accent}` : '2px solid transparent',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hide-mobile">
            <a href="/master-admin" className="btn-primary-hover" style={{ ...btnPrimary, padding: '10px 24px', fontSize: 14, borderRadius: 10 }}>
              Login <LuArrowRight size={14} />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="show-mobile-only"
            style={{ background: 'none', border: 'none', color: C.text, cursor: 'pointer', padding: 8 }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${C.border}` }}
            >
              <div style={{ ...container, padding: '16px 24px 24px' }}>
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href.slice(1))}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', fontSize: 16, fontWeight: 500, fontFamily: FONT, color: C.textSecondary, background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}
                  >
                    {link.label}
                  </button>
                ))}
                <a href="/master-admin" style={{ ...btnPrimary, width: '100%', marginTop: 16, borderRadius: 12, textAlign: 'center' }}>
                  Login
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 72, overflow: 'hidden' }}>
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`, animation: 'float 8s ease-in-out infinite', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite 2s', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', transform: 'translate(-50%, -50%)', animation: 'pulse-glow 6s ease-in-out infinite' }} />
          {/* Grid pattern overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.3 }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />
        </div>

        <motion.div style={{ ...container, position: 'relative', zIndex: 10, textAlign: 'center', padding: '60px 24px', opacity: heroOpacity, scale: heroScale }}>
          {/* Heading */}
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: C.text, marginBottom: 24 }}>
            Build your professional<br />
            <span style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentBright} 50%, #c084fc 100%)`, backgroundSize: '200% auto', animation: 'gradient-shift 4s ease-in-out infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              portfolio & resume
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: C.textSecondary, lineHeight: 1.7, maxWidth: 640, margin: '0 auto 40px' }}>
            Create stunning portfolio websites and ATS-friendly resumes that help you land your dream job. Customizable templates designed to impress.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 60 }}>
            <button onClick={() => scrollTo('pricing')} className="btn-primary-hover" style={{...btnPrimary, border: 'none'}}>
              Start Building Free <LuArrowRight size={16} />
            </button>
            <button onClick={() => scrollTo('templates')} className="btn-outline-hover" style={btnOutline}>
              View Templates
            </button>
          </motion.div>

          {/* Hero preview browser */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
            style={{ marginTop: 60, position: 'relative' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: `0 40px 100px rgba(0,0,0,0.4), 0 0 60px ${C.accentGlow}` }}>
              {/* Browser chrome */}
              <div style={{ background: C.surface, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, margin: '0 16px' }}>
                  <div style={{ background: C.bgSubtle, borderRadius: 8, padding: '6px 16px', fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
                    https://foliodrive.vercel.app/your-username
                  </div>
                </div>
              </div>
              {/* Preview content */}
              <div style={{ background: `linear-gradient(135deg, ${C.bgSubtle} 0%, ${C.surface} 100%)`, aspectRatio: '16/8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.accentGlow, border: `2px solid ${C.borderAccent}`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: C.accent }}>JD</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>John Doe</h3>
                  <p style={{ color: C.textSecondary, fontSize: 14, marginBottom: 16 }}>Full Stack Developer</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {['React', 'Node.js', 'TypeScript'].map((t) => (
                      <span key={t} style={{ padding: '4px 14px', borderRadius: 100, background: C.accentGlow, color: C.accentBright, fontSize: 12, fontWeight: 600, border: `1px solid ${C.borderAccent}` }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" style={{ ...sectionPadding, background: C.bgSubtle, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.borderAccent}, transparent)` }} />
        <div style={container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={sectionLabel}>Features</div>
            <h2 style={sectionTitle}>Everything you need to stand out</h2>
            <p style={sectionDesc}>Powerful tools designed to help professionals create impressive portfolios and land their dream jobs.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(260px, 100%, 340px), 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} className="landing-card"
                style={{
                  background: C.surface, borderRadius: 20, padding: 32, border: `1px solid ${C.border}`,
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', cursor: 'default', position: 'relative', overflow: 'hidden',
                }}>
                {/* Subtle gradient glow at top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: f.gradient, opacity: 0.6 }} />
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 4px 16px rgba(0,0,0,0.2)` }}>
                  <f.icon size={24} color="#fff" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: C.textSecondary, fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{f.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {f.highlights.map((h) => (
                    <li key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textMuted }}>
                      <LuCircleCheck size={14} style={{ color: C.accent, flexShrink: 0 }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ TEMPLATES ═══════════════ */}
      <section id="templates" style={{ ...sectionPadding, background: C.bg }}>
        <div style={container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={sectionLabel}>Templates</div>
            <h2 style={sectionTitle}>Beautiful portfolio templates</h2>
            <p style={sectionDesc}>Choose from stunning designs and customize every detail to match your brand.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px, 100%, 240px), 1fr))', gap: 24 }}>
            {TEMPLATES.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i} className="template-card"
                style={{ cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                  {/* Template wireframe */}
                  <div style={{ position: 'absolute', inset: 0, padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.accent }} />
                      <div>
                        <div style={{ height: 8, width: 80, background: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 6 }} />
                        <div style={{ height: 6, width: 56, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ height: 8, width: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
                      <div style={{ height: 8, width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                      <div style={{ height: 8, width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
                        <div style={{ height: 6, width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
                        <div style={{ height: 6, width: '70%', background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <div style={{ height: 28, width: 64, background: 'rgba(255,255,255,0.2)', borderRadius: 6 }} />
                      <div style={{ height: 28, width: 64, background: 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="template-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0, transition: 'opacity 0.3s' }}>
                    <a href={`/template/${t.id}`} style={{ ...btnPrimary, padding: '10px 24px', fontSize: 14, borderRadius: 10, textDecoration: 'none' }}>
                      Preview <LuArrowRight size={14} />
                    </a>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{t.name}</h3>
                  <p style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{t.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: 48 }}>
            <button onClick={() => scrollTo('pricing')} className="btn-outline-hover" style={{ ...btnOutline, fontSize: 14 }}>
              Customize Own Template <LuPalette size={14} style={{ marginRight: 4 }} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ PORTFOLIO SAMPLES ═══════════════ */}
      <section id="samples" style={{ ...sectionPadding, background: C.bgSubtle, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.borderAccent}, transparent)` }} />
        <div style={container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={sectionLabel}>Showcase</div>
            <h2 style={sectionTitle}>Explore live portfolio samples</h2>
            <p style={sectionDesc}>See how top professionals design their custom landing pages, projects, and work histories.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 100%, 320px), 1fr))', gap: 24, maxWidth: 1080, margin: '0 auto' }}>
            {SAMPLES.map((sample, i) => (
              <motion.div key={sample.username} variants={fadeUp} custom={i} className="pricing-card"
                style={{
                  position: 'relative',
                  background: C.surface,
                  borderRadius: 24,
                  padding: '32px',
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
                whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${sample.colors[0]}, ${sample.colors[1]})`
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${sample.colors[0]}20 0%, ${sample.colors[1]}20 100%)`,
                    border: `1.5px solid ${sample.accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    color: sample.accent
                  }}>
                    {sample.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{sample.name}</h3>
                    <p style={{ fontSize: 13, color: sample.accent, fontWeight: 600 }}>{sample.role}</p>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.5, flexGrow: 1 }}>
                  {sample.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sample.skills.map(skill => (
                    <span key={skill} style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.03)',
                      color: C.textSecondary,
                      padding: '4px 10px',
                      borderRadius: 100,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <a 
                  href={`/${sample.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#fff',
                    background: `linear-gradient(135deg, ${sample.colors[0]}d0 0%, ${sample.colors[1]}d0 100%)`,
                    borderRadius: 12,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    marginTop: 8
                  }}
                  onMouseEnter={(e) => e.target.style.filter = 'brightness(1.15)'}
                  onMouseLeave={(e) => e.target.style.filter = 'brightness(1.0)'}
                >
                  View Live Site <LuExternalLink size={14} />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" style={{ ...sectionPadding, background: C.bgSubtle, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.borderAccent}, transparent)` }} />
        <div style={container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={sectionLabel}>Pricing</div>
            <h2 style={sectionTitle}>Simple, transparent pricing</h2>
            <p style={sectionDesc}>Choose the plan that fits your needs. One-time payment, lifetime access.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(260px, 100%, 300px), 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i} className="pricing-card"
                style={{
                  position: 'relative', background: C.surface, borderRadius: 24, padding: 36,
                  border: plan.popular ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                  transition: 'all 0.4s', display: 'flex', flexDirection: 'column',
                  boxShadow: plan.popular ? `0 0 40px ${C.accentGlow}` : 'none',
                  transform: plan.popular ? 'scale(1.04)' : 'none',
                }}>
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 18px', borderRadius: 100, background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: `0 4px 16px ${C.accentGlow}` }}>
                      <LuSparkles size={12} /> Most Popular
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>{plan.name}</h3>
                  <p style={{ color: C.textMuted, fontSize: 14 }}>{plan.description}</p>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: C.text }}>{plan.price}</span>
                  <span style={{ color: C.textMuted, fontSize: 14, marginLeft: 4 }}>/{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <LuCheck size={16} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: C.textSecondary, fontSize: 14 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a href={`/payment/${plan.id}`} className="btn-primary-hover"
                  style={{
                    ...plan.popular ? btnPrimary : btnOutline,
                    width: '100%', borderRadius: 12, padding: '12px 24px', fontSize: 15, textAlign: 'center', textDecoration: 'none',
                  }}>
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', color: C.textMuted, fontSize: 13, marginTop: 48 }}>
            All prices in Indian Rupees (INR). Prices inclusive of GST.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <section id="contact" style={{ ...sectionPadding, background: C.bg, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.borderAccent}, transparent)` }} />
        <div style={container}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div style={sectionLabel}>Contact Us</div>
              <h2 style={{ ...sectionTitle, margin: 0 }}>Get in touch</h2>
              <p style={{ color: C.textSecondary, fontSize: 17, lineHeight: 1.7, marginTop: 16, marginBottom: 32 }}>
                Questions about FolioDrive? Want to learn how we can help you land your dream job? We'd love to hear from you.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '16px 28px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accentGlow, border: `1px solid ${C.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LuMail size={20} style={{ color: C.accent }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>Email Us</h4>
                    <a href="mailto:bringmyfolio@outlook.com" style={{ color: C.accentBright, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>bringmyfolio@outlook.com</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ BACK TO TOP ═══════════════ */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 92, right: 28, width: 48, height: 48, borderRadius: 14,
              background: C.surface, border: `1px solid ${C.border}`, color: C.accent,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 99, transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDark; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.accent; }}
          >
            <LuChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════════ TOASTS ═══════════════ */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 24, right: 24, zIndex: 10000, padding: '14px 22px', fontSize: 14, fontWeight: 600, fontFamily: FONT, color: '#fff', background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: 14, boxShadow: '0 12px 32px rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LuCheck size={16} /> {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 24, right: 24, zIndex: 10000, padding: '14px 22px', fontSize: 14, fontWeight: 600, fontFamily: FONT, color: '#fff', background: 'linear-gradient(135deg, #dc2626, #ef4444)', borderRadius: 14, boxShadow: '0 12px 32px rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LuInfo size={16} /> {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
