import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuArrowLeft, LuUser, LuMail, LuMapPin, LuShield,
  LuCheck, LuX, LuUpload, LuTag, LuChevronDown, LuArrowRight,
  LuAtSign, LuPhone as LuPhoneIcon
} from 'react-icons/lu';
import ErrorCardPage from '../components/layout/ErrorCardPage';

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const C = {
  bg: '#09090b', bgSubtle: '#0f1117', surface: '#141820', surfaceHover: '#1a1f2e',
  text: '#f0f2f5', textSecondary: '#94a3b8', textMuted: '#64748b',
  accent: '#818cf8', accentBright: '#a5b4fc', accentDark: '#6366f1',
  accentGlow: 'rgba(129,140,248,0.15)', accentGlowStrong: 'rgba(129,140,248,0.25)',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(255,255,255,0.12)', borderAccent: 'rgba(129,140,248,0.3)',
  success: '#34d399', error: '#f87171', errorGlow: 'rgba(248,113,113,0.15)',
};

const PLANS = {
  starter: { name: 'Starter', price: 300, priceLabel: '₹300' },
  professional: { name: 'Professional', price: 580, priceLabel: '₹580' },
  premium: { name: 'Premium', price: 890, priceLabel: '₹890' },
};

const VALID_PROMOS = {
  'FOLIO50': { discount: 50, label: '₹50 off' },
  'WELCOME100': { discount: 100, label: '₹100 off' },
  'LAUNCH20': { discount: 20, label: '₹20 off', percent: false },
};

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', minLen: 10, maxLen: 10 },
  { code: '+1', country: 'US / Canada', flag: '🇺🇸', minLen: 10, maxLen: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', minLen: 10, maxLen: 10 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', minLen: 9, maxLen: 9 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', minLen: 10, maxLen: 10 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', minLen: 10, maxLen: 11 },
  { code: '+33', country: 'France', flag: '🇫🇷', minLen: 9, maxLen: 9 },
  { code: '+86', country: 'China', flag: '🇨🇳', minLen: 11, maxLen: 11 },
  { code: '+971', country: 'UAE', flag: '🇦🇪', minLen: 9, maxLen: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', minLen: 8, maxLen: 8 },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', minLen: 10, maxLen: 11 },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', minLen: 10, maxLen: 11 },
  { code: '+7', country: 'Russia', flag: '🇷🇺', minLen: 10, maxLen: 10 },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', minLen: 9, maxLen: 9 },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', minLen: 10, maxLen: 10 },
];

/* ─── QR Code SVG (placeholder for UPI payment) ─── */
function QRCodePlaceholder({ size = 200 }) {
  // Generate a deterministic but QR-like pattern
  const cells = 21;
  const cellSize = size / cells;
  const pattern = useMemo(() => {
    const grid = [];
    // Finder patterns (3 corners)
    const addFinder = (r, c) => {
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))
          grid.push({ r: r + i, c: c + j });
      }
    };
    addFinder(0, 0); addFinder(0, 14); addFinder(14, 0);
    // Data modules
    const seed = 42;
    for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
      const inFinder = (i < 8 && j < 8) || (i < 8 && j > 12) || (i > 12 && j < 8);
      if (!inFinder && ((i * 31 + j * 17 + seed) % 3 === 0)) grid.push({ r: i, c: j });
    }
    return grid;
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8 }}>
      <rect width={size} height={size} fill="#fff" rx="8" />
      {pattern.map((p, idx) => (
        <rect key={idx} x={p.c * cellSize} y={p.r * cellSize} width={cellSize} height={cellSize} fill="#000" />
      ))}
    </svg>
  );
}

/* ─── Shared Styles ─── */
const inputBase = {
  width: '100%', padding: '12px 16px', fontSize: 14, fontFamily: FONT,
  color: C.text, background: C.bgSubtle, border: `1px solid ${C.border}`,
  borderRadius: 12, outline: 'none', transition: 'all 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted,
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: FONT,
  color: '#fff', background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
  border: 'none', borderRadius: 14, cursor: 'pointer', textDecoration: 'none',
  boxShadow: `0 4px 20px ${C.accentGlow}`, transition: 'all 0.3s',
};

export default function PaymentPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = PLANS[planId];

  useEffect(() => {
    if (plan) {
      document.title = `Checkout — ${plan.name} Plan — FolioDrive`;
    } else {
      document.title = `Checkout — FolioDrive`;
    }
  }, [plan]);

  // Step tracking
  const [step, setStep] = useState(1); // 1: form, 2: QR + upload, 3: confirmation

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryIdx, setCountryIdx] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [address, setAddress] = useState('');

  // Promo
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // null | 'valid' | 'invalid'
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Upload
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentFileName, setPaymentFileName] = useState('');

  // Validation
  const [errors, setErrors] = useState({});

  if (!plan) {
    return (
      <ErrorCardPage
        errorCode="PLAN ERROR"
        title="Pricing Plan Not Found"
        description={`The plan "${planId}" you are attempting to purchase does not exist.`}
        primaryButtonText="View Pricing Plans"
        primaryButtonAction="/#pricing"
        secondaryButtonText="Go to Homepage"
        secondaryButtonAction="/"
      />
    );
  }

  const selectedCountry = COUNTRY_CODES[countryIdx];
  const finalPrice = Math.max(0, plan.price - appliedDiscount);

  const validateUsername = (val) => {
    if (/\s/.test(val)) return 'Username cannot contain spaces';
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(val)) return 'Only letters, numbers, and - allowed';
    
    const reservedUsernames = [
      'admin', 'payment', 'template', 'showcase', 'master-admin', 'root-admin',
      'api', 'static', 'media', 'login', 'logout', 'register', 'dashboard',
      'pricing', 'features', 'contact', 'mimi', 'help', 'support'
    ];
    if (reservedUsernames.includes(val.toLowerCase().trim())) {
      return 'This username is reserved and cannot be used';
    }
    return null;
  };

  const validatePhone = (val) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length < selectedCountry.minLen) return `Phone must be ${selectedCountry.minLen} digits for ${selectedCountry.country}`;
    if (digitsOnly.length > selectedCountry.maxLen) return `Phone must be max ${selectedCountry.maxLen} digits for ${selectedCountry.country}`;
    return null;
  };

  const handleApplyPromo = () => {
    const upper = promoCode.trim().toUpperCase();
    if (VALID_PROMOS[upper]) {
      setPromoStatus('valid');
      setAppliedDiscount(VALID_PROMOS[upper].discount);
    } else {
      setPromoStatus('invalid');
      setAppliedDiscount(0);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    const usernameErr = validateUsername(username);
    if (usernameErr) newErrors.username = usernameErr;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (!address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!paymentFile) {
      setErrors({ upload: 'Please upload the payment screenshot' });
      return;
    }
    setErrors({});
    setStep(3);
  };

  const container = { maxWidth: 640, margin: '0 auto', padding: '0 24px' };

  /* ═══════════════════════════════════════════════════════════════
     STEP 3: CONFIRMATION
     ═══════════════════════════════════════════════════════════════ */
  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          .home-link:hover { color: ${C.accent} !important; text-decoration: underline !important; }
        `}</style>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', padding: 40, maxWidth: 500 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: `2px solid ${C.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <LuShield size={36} style={{ color: C.success }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 12 }}>Payment Verification in Progress</h1>
          <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.7, marginBottom: 8 }}>
            Your payment for the <strong style={{ color: C.accent }}>{plan.name}</strong> plan is being verified.
          </p>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 32 }}>
            We'll confirm your payment within 24 hours. You'll receive an email at <strong style={{ color: C.textSecondary }}>{email}</strong> once your account is activated.
          </p>
          <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Plan</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{plan.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Amount Paid</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.success }}>₹{finalPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Username</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>@{username}</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>
            For any queries, contact us at <strong style={{ color: C.accentBright }}>bringmyfolio@outlook.com</strong>
          </p>
          <a href="/" className="home-link"
            style={{ fontSize: 15, fontWeight: 600, color: C.textSecondary, textDecoration: 'none', transition: 'color 0.2s' }}>
            ← Go to Home
          </a>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     STEP 2: QR CODE + UPLOAD
     ═══════════════════════════════════════════════════════════════ */
  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FONT }}>
        <style>{`
          .pay-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentGlow} !important; }
          .pay-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px ${C.accentGlowStrong} !important; }
          .back-link:hover { color: ${C.text} !important; }
        `}</style>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, maxWidth: 640 }}>
            <button onClick={() => setStep(1)} className="back-link"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: C.textSecondary, fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>
              <LuArrowLeft size={16} /> Back
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>Step 2 of 2</span>
          </div>
        </header>

        <div style={{ ...container, padding: '48px 24px 80px', maxWidth: 640 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8, textAlign: 'center' }}>Complete Your Payment</h1>
            <p style={{ fontSize: 15, color: C.textSecondary, textAlign: 'center', marginBottom: 40 }}>Scan the QR code below and upload the payment screenshot</p>

            {/* Price display */}
            <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.borderAccent}`, marginBottom: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Amount to Pay</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: C.text }}>₹{finalPrice}</div>
              <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginTop: 4 }}>{plan.name} Plan — One-time</div>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <QRCodePlaceholder size={220} />
              </div>
              <p style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>Scan using any UPI app to make payment</p>
            </div>

            {/* Upload Section */}
            <form onSubmit={handleStep2Submit}>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Upload Payment Screenshot <span style={{ color: C.error }}>*</span></label>
                <label
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                    padding: '32px 24px', borderRadius: 16, border: `2px dashed ${errors.upload ? C.error : C.border}`,
                    background: errors.upload ? C.errorGlow : C.bgSubtle, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentGlow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = errors.upload ? C.error : C.border; e.currentTarget.style.background = errors.upload ? C.errorGlow : C.bgSubtle; }}
                >
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setPaymentFile(file); setPaymentFileName(file.name); setErrors({}); }
                  }} />
                  {paymentFileName ? (
                    <>
                      <LuCheck size={28} style={{ color: C.success }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.success }}>{paymentFileName}</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>Click to change file</span>
                    </>
                  ) : (
                    <>
                      <LuUpload size={28} style={{ color: C.textMuted }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.textSecondary }}>Click to upload screenshot</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>PNG, JPG up to 5MB</span>
                    </>
                  )}
                </label>
                {errors.upload && <p style={{ color: C.error, fontSize: 12, marginTop: 6 }}>{errors.upload}</p>}
              </div>

              {/* Contact email */}
              <div style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                <LuMail size={18} style={{ color: C.accent, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 2 }}>Need help? Contact us</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.accentBright }}>bringmyfolio@outlook.com</div>
                </div>
              </div>

              <button type="submit" className="pay-btn" style={{ ...btnPrimary, width: '100%', padding: '16px 32px', fontSize: 16, borderRadius: 14 }}>
                Submit Payment <LuArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     STEP 1: FORM
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FONT }}>
      <style>{`
        .pay-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentGlow} !important; }
        .pay-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px ${C.accentGlowStrong} !important; }
        .back-btn:hover { background: ${C.surface} !important; border-color: ${C.accent} !important; }
        .promo-apply:hover { background: ${C.accentDark} !important; }
        @media (max-width: 480px) {
          .payment-summary-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .payment-summary-header > div {
            text-align: left !important;
          }
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, maxWidth: 640 }}>
          <button onClick={() => navigate('/#pricing')} className="back-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 16px', color: C.text, fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s' }}>
            <LuArrowLeft size={16} /> Back to Plans
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>Step 1 of 2</span>
        </div>
      </header>

      <div style={{ ...container, padding: '48px 24px 80px', maxWidth: 640 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Plan header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8 }}>Get {plan.name} Plan</h1>
            <p style={{ fontSize: 15, color: C.textSecondary }}>Fill in your details to proceed with payment</p>
          </div>

          {/* Price card */}
          <div className="payment-summary-header" style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.borderAccent}`, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 2 }}>{plan.name} Plan</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{plan.priceLabel}</div>
              <div style={{ fontSize: 12, color: C.accent }}>One-time payment</div>
            </div>
            {appliedDiscount > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: C.textMuted, textDecoration: 'line-through' }}>₹{plan.price}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.success }}>₹{finalPrice}</div>
                <div style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>-₹{appliedDiscount} applied</div>
              </div>
            )}
          </div>

          <form onSubmit={handleStep1Submit}>
            {/* Full Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Full Name <span style={{ color: C.error }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <LuUser size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, zIndex: 1 }} />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name"
                  className="pay-input" style={{ ...inputBase, paddingLeft: 42, borderColor: errors.fullName ? C.error : C.border }} />
              </div>
              {errors.fullName && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{errors.fullName}</p>}
            </div>

            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Username <span style={{ color: C.error }}>*</span> <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', color: C.textMuted }}>(only letters, numbers, and - allowed)</span></label>
              <div style={{ position: 'relative' }}>
                <LuAtSign size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, zIndex: 1 }} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} placeholder="your-portfolio"
                  className="pay-input" style={{ ...inputBase, paddingLeft: 42, borderColor: errors.username ? C.error : C.border }} />
              </div>
              {errors.username && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{errors.username}</p>}
              {username && !errors.username && <p style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Your portfolio URL: foliodrive.in/{username}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email <span style={{ color: C.error }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <LuMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, zIndex: 1 }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                  className="pay-input" style={{ ...inputBase, paddingLeft: 42, borderColor: errors.email ? C.error : C.border }} />
              </div>
              {errors.email && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Phone <span style={{ color: C.error }}>*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Country selector */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowCountryPicker(!showCountryPicker)}
                    style={{
                      ...inputBase, width: 'auto', padding: '12px 32px 12px 12px', display: 'flex', alignItems: 'center', gap: 6,
                      cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', minWidth: 100,
                    }}>
                    <span>{selectedCountry.flag}</span>
                    <span style={{ fontWeight: 600 }}>{selectedCountry.code}</span>
                    <LuChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                  </button>
                  <AnimatePresence>
                    {showCountryPicker && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        style={{
                          position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 260, maxHeight: 240, overflowY: 'auto',
                          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                        }}>
                        {COUNTRY_CODES.map((cc, idx) => (
                          <button key={cc.code} type="button" onClick={() => { setCountryIdx(idx); setShowCountryPicker(false); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: idx === countryIdx ? C.accentGlow : 'transparent',
                              border: 'none', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: C.text, textAlign: 'left',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHover}
                            onMouseLeave={(e) => e.currentTarget.style.background = idx === countryIdx ? C.accentGlow : 'transparent'}>
                            <span>{cc.flag}</span>
                            <span style={{ flex: 1 }}>{cc.country}</span>
                            <span style={{ color: C.textMuted, fontWeight: 600 }}>{cc.code}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Phone input */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={`${'0'.repeat(selectedCountry.minLen)}`} maxLength={selectedCountry.maxLen}
                    className="pay-input" style={{ ...inputBase, borderColor: errors.phone ? C.error : C.border }} />
                </div>
              </div>
              {errors.phone && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
              <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{selectedCountry.country}: {selectedCountry.minLen}{selectedCountry.minLen !== selectedCountry.maxLen ? `-${selectedCountry.maxLen}` : ''} digits required</p>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Address <span style={{ color: C.error }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <LuMapPin size={16} style={{ position: 'absolute', left: 14, top: 14, color: C.textMuted, zIndex: 1 }} />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your full address" rows={3}
                  className="pay-input" style={{ ...inputBase, paddingLeft: 42, paddingTop: 12, resize: 'none', minHeight: 80, borderColor: errors.address ? C.error : C.border }} />
              </div>
              {errors.address && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{errors.address}</p>}
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '32px 0' }} />

            {/* Promo Code */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}><LuTag size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Promo Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoStatus(null); }}
                  placeholder="Enter promo code" className="pay-input"
                  style={{
                    ...inputBase, flex: 1, textTransform: 'uppercase',
                    borderColor: promoStatus === 'invalid' ? C.error : promoStatus === 'valid' ? C.success : C.border,
                  }} />
                <button type="button" onClick={handleApplyPromo} className="promo-apply"
                  style={{
                    padding: '12px 20px', fontSize: 14, fontWeight: 600, fontFamily: FONT,
                    color: '#fff', background: C.accent, border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
                    whiteSpace: 'nowrap',
                  }}>
                  Apply
                </button>
              </div>
              {promoStatus === 'invalid' && <p style={{ color: C.error, fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><LuX size={12} /> Invalid promo code</p>}
              {promoStatus === 'valid' && <p style={{ color: C.success, fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><LuCheck size={12} /> {VALID_PROMOS[promoCode.trim().toUpperCase()].label} applied!</p>}
            </div>

            {/* Summary */}
            <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: C.textSecondary }}>{plan.name} Plan</span>
                <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>₹{plan.price}</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: C.success }}>Promo Discount</span>
                  <span style={{ fontSize: 14, color: C.success, fontWeight: 600 }}>-₹{appliedDiscount}</span>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, color: C.text, fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 20, color: C.accent, fontWeight: 800 }}>₹{finalPrice}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="pay-btn" style={{ ...btnPrimary, width: '100%', padding: '16px 32px', fontSize: 16, borderRadius: 14 }}>
              Make Payment <LuArrowRight size={16} />
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 16 }}>
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
