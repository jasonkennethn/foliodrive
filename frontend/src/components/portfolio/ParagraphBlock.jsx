import { motion } from 'framer-motion';

export default function ParagraphBlock({ block }) {
  if (!block.text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: '740px',
      }}
    >
      <p
        style={{
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {block.text}
      </p>
    </motion.div>
  );
}
