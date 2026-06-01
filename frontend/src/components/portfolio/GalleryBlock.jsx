import { motion } from 'framer-motion';

export default function GalleryBlock({ block }) {
  // Gallery uses the single image field — each gallery block is one image
  if (!block.image) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
      }}
    >
      <motion.img
        src={block.image}
        alt={block.title || 'Gallery image'}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          height: '250px',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {block.title && (
        <div
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface)',
          }}
        >
          {block.title}
        </div>
      )}
    </motion.div>
  );
}
