import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiHome } from 'react-icons/fi';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #09090b 100%)',
        color: '#f4f4f5',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
      }}
    >
      {/* Glowing blur background shapes */}
      <div
        style={{
          position: 'absolute',
          width: '45vw',
          height: '45vw',
          top: '10%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '35vw',
          height: '35vw',
          bottom: '10%',
          right: '10%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Main Glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(30, 30, 36, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '48px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Animated Icon Container */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.15, stiffness: 200, damping: 12 }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            margin: '0 auto 24px',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)',
          }}
        >
          <FiAlertTriangle size={36} />
        </motion.div>

        {/* 404 text code */}
        <span
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#818cf8',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          Error 404
        </span>

        {/* Error header */}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
            color: '#ffffff',
          }}
        >
          Page Not Found
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '15px',
            color: '#a1a1aa',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
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
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <FiHome size={16} />
            Go to Homepage
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f4f4f5',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 600,
              fontSize: '15px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
