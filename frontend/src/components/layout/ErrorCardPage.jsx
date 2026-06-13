import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const FONT = "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function ErrorCardPage({
  errorCode = 'ERROR',
  title = 'Something Went Wrong',
  description = 'An unexpected error occurred. Please try again or return to safety.',
  icon: Icon = FiAlertTriangle,
  primaryButtonText = 'Go to Homepage',
  primaryButtonAction = '/',
  secondaryButtonText = 'Go Back',
  secondaryButtonAction = -1,
}) {
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (typeof action === 'function') {
      action();
    } else if (typeof action === 'number') {
      navigate(action);
    } else {
      navigate(action);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #15143a 0%, #09090b 100%)',
        color: '#f4f4f5',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Glowing blur background shapes */}
      <div
        style={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          top: '5%',
          left: '5%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          bottom: '5%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />

      {/* Main Glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(20, 24, 32, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '24px',
          padding: 'clamp(24px, 5vw, 48px) clamp(20px, 4vw, 36px)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Animated Icon Container */}
        <motion.div
          initial={{ scale: 0.85, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1, stiffness: 200, damping: 14 }}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            margin: '0 auto 24px',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.1)',
          }}
        >
          <Icon size={32} />
        </motion.div>

        {/* Error code label */}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#a5b4fc',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          {errorCode}
        </span>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(24px, 4.5vw, 32px)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
            color: '#ffffff',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: '#94a3b8',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          {description}
        </p>

        {/* Actions grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
          }}
        >
          {primaryButtonText && (
            <button
              onClick={() => handleAction(primaryButtonAction)}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                fontFamily: FONT,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.25)'; }}
            >
              {primaryButtonText}
            </button>
          )}

          {secondaryButtonText && (
            <button
              onClick={() => handleAction(secondaryButtonAction)}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#f4f4f5',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                fontFamily: FONT,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
