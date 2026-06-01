import { motion } from 'framer-motion';
import CardBlock from './CardBlock';
import ParagraphBlock from './ParagraphBlock';
import SkillBadges from './SkillBadges';
import TimelineBlock from './TimelineBlock';
import GalleryBlock from './GalleryBlock';
import EmbedBlock from './EmbedBlock';

const blockComponents = {
  card: CardBlock,
  paragraph: ParagraphBlock,
  skills: SkillBadges,
  timeline: TimelineBlock,
  gallery: GalleryBlock,
  embed: EmbedBlock,
};

export default function SectionRenderer({ section, index }) {
  if (!section || !section.blocks || section.blocks.length === 0) return null;

  const secNum = index !== undefined ? String(index + 1).padStart(2, '0') : null;

  // Determine layout: cards and galleries get a grid, others stack vertically
  const cardBlocks = section.blocks.filter((b) => b.block_type === 'card');
  const galleryBlocks = section.blocks.filter((b) => b.block_type === 'gallery');
  const otherBlocks = section.blocks.filter(
    (b) => b.block_type !== 'card' && b.block_type !== 'gallery'
  );

  return (
    <motion.section
      id={`section-${section.id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: '60px 0',
      }}
    >
      <div className="container-portfolio">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          {secNum && (
            <span style={{ color: 'var(--accent-color)', marginRight: '10px', fontWeight: 700 }}>
              {secNum}.
            </span>
          )}
          {section.title}
        </motion.h2>

        {/* Decorative line under title */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: '40px',
            height: '3px',
            background: 'var(--accent-color)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '40px',
            transformOrigin: 'left',
          }}
        />

        {/* Other blocks (paragraphs, skills, timeline, embed) — stacked */}
        {otherBlocks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: cardBlocks.length > 0 || galleryBlocks.length > 0 ? '40px' : '0' }}>
            {otherBlocks.map((block) => {
              const BlockComponent = blockComponents[block.block_type];
              if (!BlockComponent) return null;
              return <BlockComponent key={block.id} block={block} />;
            })}
          </div>
        )}

        {/* Card blocks — responsive grid */}
        {cardBlocks.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: galleryBlocks.length > 0 ? '40px' : '0',
            }}
          >
            {cardBlocks.map((block, i) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <CardBlock block={block} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Gallery blocks — responsive grid */}
        {galleryBlocks.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px',
            }}
          >
            {galleryBlocks.map((block) => (
              <GalleryBlock key={block.id} block={block} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
