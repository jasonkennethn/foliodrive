import { motion } from 'framer-motion';

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Background glow orb */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Animation Styles */}
      <style>{`
        @keyframes loader-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes text-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.98); }
          50% { opacity: 0.9; transform: scale(1); }
        }
        .loader-ring {
          animation: loader-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
        .loader-text {
          animation: text-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Main Loader graphic */}
      <div style={{ position: 'relative', width: 64, height: 64, zIndex: 1, marginBottom: 24 }}>
        {/* Background track */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.03)',
          }}
        />
        {/* Spinning indicator */}
        <div
          className="loader-ring"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#818cf8',
            borderRightColor: '#6366f1',
          }}
        />
      </div>

      {/* Loader label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="loader-text"
        style={{
          zIndex: 1,
          fontSize: 13,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textAlign: 'center',
          maxWidth: '280px',
          lineHeight: 1.5,
        }}
      >
        {message}
      </motion.div>
    </div>
  );
}
