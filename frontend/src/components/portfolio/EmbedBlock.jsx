import { motion } from 'framer-motion';

export default function EmbedBlock({ block }) {
  if (!block.embed_url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        position: 'relative',
        paddingBottom: '56.25%', /* 16:9 aspect ratio */
        height: 0,
      }}
    >
      <iframe
        src={block.embed_url}
        title={block.title || 'Embedded content'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </motion.div>
  );
}
