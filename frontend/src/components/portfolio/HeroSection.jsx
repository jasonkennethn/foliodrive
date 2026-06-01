import { motion } from 'framer-motion';
import { usePortfolio } from '../../context/PortfolioContext';
import { FiUser, FiMapPin } from 'react-icons/fi';

export default function HeroSection() {
  const { profile } = usePortfolio();

  if (!profile) return null;

  return (
    <section
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0 60px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-color) 8%, transparent) 0%, transparent 70%)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      <div
        className="container-portfolio"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
          zIndex: 1,
        }}
      >
        {/* Profile Picture */}
        {profile.show_profile_pic && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid var(--accent-color)',
              boxShadow: `0 0 35px color-mix(in srgb, var(--accent-color) 20%, transparent)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-elevated)',
              marginBottom: '8px',
            }}
          >
            {profile.profile_pic ? (
              <img
                src={profile.profile_pic}
                alt={profile.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <FiUser size={44} style={{ color: 'var(--text-muted)' }} />
            )}
          </motion.div>
        )}

        {/* Intro Tagline (Hello I'm) */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--accent-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
          }}
        >
          {profile.custom_intro || "Hello, I'm"}
        </motion.span>

        {/* Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(36px, 7vw, 68px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
          }}
        >
          {profile.name}
        </motion.h1>

        {/* Professional Role */}
        {profile.role && (
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(18px, 3vw, 28px)',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.02em',
            }}
          >
            {profile.role}
          </motion.h2>
        )}

        {/* Location Badge */}
        {profile.location && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              marginTop: '4px',
            }}
          >
            <FiMapPin size={14} style={{ color: 'var(--accent-color)' }} />
            {profile.location}
          </motion.div>
        )}

        {/* Tagline / Bio Text */}
        {profile.tagline && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              lineHeight: 1.6,
              marginTop: '8px',
            }}
          >
            {profile.tagline}
          </motion.p>
        )}

        {/* Decorative separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            width: '40px',
            height: '2px',
            background: 'var(--accent-color)',
            borderRadius: 'var(--radius-full)',
            marginTop: '16px',
          }}
        />
      </div>
    </section>
  );
}
