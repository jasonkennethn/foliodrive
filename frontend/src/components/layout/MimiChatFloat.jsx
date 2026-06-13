import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuX, LuSparkles, LuCheck, LuUser, LuMessageSquare, LuInfo,
  LuSend
} from 'react-icons/lu';

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const C = {
  bg: '#09090b',
  bgSubtle: '#0f1117',
  surface: '#141820',
  surfaceHover: '#1a1f2e',
  accent: '#818cf8',
  accentBright: '#a5b4fc',
  accentDark: '#6366f1',
  accentGlow: 'rgba(129,140,248,0.15)',
  accentGlowStrong: 'rgba(129,140,248,0.25)',
  border: 'rgba(255,255,255,0.06)',
  borderAccent: 'rgba(129,140,248,0.3)',
  success: '#34d399',
  text: '#f0f2f5',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
};

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
    return "FolioDrive is a premium portfolio and ATS-friendly resume builder. It allows professionals to select beautiful templates, customize their pages in real time via our editor, export ATS-ready resumes, and host their portfolios on their own username subdomains.";
  }
  
  return "I'm sorry, I can only assist with questions about FolioDrive (features, plans, payments, templates, and editor). Please ask me a question related to FolioDrive!";
};

export default function MimiChatFloat() {
  const location = useLocation();
  const allowedPaths = ['/'];
  const showChat = allowedPaths.includes(location.pathname) || 
                   location.pathname.startsWith('/template/') || 
                   location.pathname.startsWith('/payment/');

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'mimi', text: "Hi, I'm MIMI! Ask me anything about FolioDrive (features, plans, checkout, templates, customization). I'm happy to help!" }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = null) => {
    const text = textToSend !== null ? textToSend : input;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      const replyText = generateMimiResponse(text);
      setMessages(prev => [...prev, { sender: 'mimi', text: replyText }]);
    }, 600);
  };

  if (!showChat) return null;

  return (
    <div className="mimi-container" style={{ fontFamily: FONT, position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Responsive Styles & Animation */}
      <style>{`
        @keyframes mimi-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        .mimi-fab {
          animation: mimi-pulse 2s infinite;
        }
        .mimi-fab:hover {
          animation: none !important;
          transform: scale(1.1) !important;
        }
        .mimi-chat-input:focus {
          border-color: ${C.accent} !important;
        }
        @media (max-width: 640px) {
          .mimi-container {
            bottom: 16px !important;
            right: 16px !important;
          }
          .mimi-chat-window {
            width: calc(100vw - 32px) !important;
            max-width: none !important;
            height: 420px !important;
            bottom: 0 !important;
            right: 0 !important;
          }
        }
      `}</style>

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="mimi-fab"
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer', boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
            transition: 'all 0.2s',
          }}
          aria-label="Ask MIMI AI Assistant"
        >
          <LuSparkles size={24} />
        </button>
      )}

      {/* Chat popup window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mimi-chat-window"
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 360, maxWidth: 'calc(100vw - 48px)', height: 480,
              background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`,
              boxShadow: '0 24px 70px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, padding: '16px 20px', background: C.bgSubtle }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accentGlow, border: `1px solid ${C.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <LuSparkles size={18} style={{ color: C.accent }} />
                  <span style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: C.success, border: `2px solid ${C.bgSubtle}` }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Ask MIMI</h3>
                  <p style={{ fontSize: 10, color: C.success, margin: 0, fontWeight: 600 }}>Active Online Assistant</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close Chat"
              >
                <LuX size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '20px', scrollbarWidth: 'thin' }}>
              {messages.map((msg, idx) => {
                const isMimi = msg.sender === 'mimi';
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: isMimi ? 'flex-start' : 'flex-end', alignItems: 'flex-start', gap: 8 }}>
                    {isMimi && (
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: C.bgSubtle, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <LuSparkles size={12} style={{ color: C.accent }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '80%', padding: '10px 14px', borderRadius: 16, fontSize: 13, lineHeight: 1.5,
                      background: isMimi ? C.bgSubtle : `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
                      color: isMimi ? C.text : '#fff',
                      border: isMimi ? `1px solid ${C.border}` : 'none',
                      borderTopLeftRadius: isMimi ? 4 : 16,
                      borderTopRightRadius: isMimi ? 16 : 4,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Footer Inputs */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '16px 20px', borderTop: `1px solid ${C.border}`, background: C.bgSubtle }}>
              {/* Input field */}
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask MIMI about FolioDrive..."
                  className="mimi-chat-input"
                  style={{
                    flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
                    padding: '10px 14px', fontSize: 13, color: C.text, fontFamily: FONT, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`, border: 'none', borderRadius: 12,
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <LuSend size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
