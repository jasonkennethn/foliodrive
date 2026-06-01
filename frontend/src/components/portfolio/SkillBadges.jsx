import { motion } from 'framer-motion';

export default function SkillBadges({ block }) {
  if (!block.tags) return null;

  const tags = block.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (tags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      {tags.map((tag, index) => (
        <motion.span
          key={index}
          className="badge-accent"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
          whileHover={{ scale: 1.05 }}
        >
          {tag}
        </motion.span>
      ))}
    </motion.div>
  );
}
