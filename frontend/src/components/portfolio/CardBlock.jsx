import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

export default function CardBlock({ block }) {
  const hasImage = !!block.image;
  const hasLink = !!block.link;

  const CardContent = (
    <motion.div
      className="card-surface"
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: hasLink ? 'pointer' : 'default',
      }}
    >
      {/* Card image */}
      {hasImage && (
        <div
          style={{
            width: '100%',
            height: '200px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={block.image}
            alt={block.title || 'Card image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform var(--transition-slow)',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          />
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {block.title && (
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {block.title}
            {hasLink && <FiExternalLink size={14} style={{ color: 'var(--accent-color)' }} />}
          </h3>
        )}
        {block.description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              flex: 1,
            }}
          >
            {block.description}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (hasLink) {
    return (
      <a
        href={block.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
