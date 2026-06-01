import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

export default function TimelineBlock({ block }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        gap: '20px',
        position: 'relative',
        paddingLeft: '24px',
      }}
    >
      {/* Timeline line + dot */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '6px',
          bottom: '-20px',
          width: '2px',
          background: 'var(--border-color)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-4px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'var(--accent-color)',
            boxShadow: `0 0 10px color-mix(in srgb, var(--accent-color) 40%, transparent)`,
          }}
        />
      </div>

      <div style={{ flex: 1 }}>
        {/* Date */}
        {block.timeline_date && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--accent-color)',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            <FiCalendar size={12} />
            {block.timeline_date}
          </div>
        )}
        {/* Title */}
        {block.timeline_title && (
          <h4
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            {block.timeline_title}
          </h4>
        )}
        {/* Description */}
        {block.timeline_description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {block.timeline_description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
