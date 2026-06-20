import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import api from '../../api/axiosConfig';
import AIAssistant from './AIAssistant';
import {
  FiPlus, FiTrash2, FiArrowLeft, FiSave, FiCheck,
  FiType, FiCreditCard, FiCode, FiClock, FiImage, FiLink,
} from 'react-icons/fi';

const BLOCK_TYPES = [
  { value: 'card', label: 'Card', icon: FiCreditCard, description: 'Image + title + description + link' },
  { value: 'paragraph', label: 'Paragraph', icon: FiType, description: 'A text block' },
  { value: 'skills', label: 'Skills', icon: FiCode, description: 'Tag-style skill badges' },
  { value: 'timeline', label: 'Timeline', icon: FiClock, description: 'Date + title + description' },
  { value: 'gallery', label: 'Gallery', icon: FiImage, description: 'Image with optional caption' },
  { value: 'embed', label: 'Embed', icon: FiLink, description: 'Embed a URL (YouTube, etc.)' },
];

function BlockRow({
  block,
  editingBlock,
  setEditingBlock,
  deleteBlock,
  saveBlock,
  saving,
  renderBlockForm,
}) {
  const dragControls = useDragControls();
  const typeInfo = BLOCK_TYPES.find((bt) => bt.value === block.block_type);
  const Icon = typeInfo?.icon || FiType;
  const isEditing = editingBlock?.id === block.id;

  return (
    <Reorder.Item
      value={block}
      id={block.id.toString()}
      dragListener={false}
      dragControls={dragControls}
      style={{
        padding: '16px',
        background: 'var(--bg-surface)',
        border: `1px solid ${isEditing ? 'var(--accent-color)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        touchAction: 'none',
      }}
      className="deletable-wrapper"
    >
      {/* Delete overlay button */}
      <button
        className="delete-btn-overlay"
        type="button"
        onClick={() => deleteBlock(block.id)}
        title="Delete this block"
      >
        <FiTrash2 size={14} />
      </button>

      <div style={{ display: 'flex', gap: '12px', alignItems: isEditing ? 'flex-start' : 'center' }}>
        {/* Drag handle */}
        {!isEditing && (
          <div
            onPointerDown={(e) => dragControls.start(e)}
            style={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginRight: '-4px',
            }}
            className="drag-handle"
            title="Drag to reorder"
          >
            <svg
              width="10"
              height="16"
              viewBox="0 0 12 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M4 3h.01M8 3h.01M4 9h.01M8 9h.01M4 15h.01M8 15h.01" />
            </svg>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {/* Block Header / Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: isEditing ? '16px' : '0',
              cursor: isEditing ? 'default' : 'pointer',
              paddingRight: '28px',
            }}
            onClick={() => !isEditing && setEditingBlock({ ...block })}
          >
            <Icon size={16} style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {typeInfo?.label || block.block_type}
            </span>
            {block.title && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                — {block.title}
              </span>
            )}
            {block.timeline_title && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                — {block.timeline_title}
              </span>
            )}
            {!isEditing && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Click to edit
              </span>
            )}
          </div>

          {/* Editing form */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {renderBlockForm(editingBlock, setEditingBlock)}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    className="btn-accent"
                    type="button"
                    onClick={() => saveBlock(editingBlock)}
                    disabled={saving}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    {saving ? 'Saving...' : (
                      <>
                        <FiSave size={14} />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() => setEditingBlock(null)}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function ContentBlockEditor({ section, onBack, onChanged }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (section) fetchBlocks();
  }, [section]);

  const fetchBlocks = async () => {
    try {
      const res = await api.get(`/sections/${section.id}/`);
      setBlocks(res.data.blocks || []);
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (newBlocks) => {
    setBlocks(newBlocks);
    try {
      await api.patch('/blocks/reorder/', {
        order: newBlocks.map((b) => b.id),
      });
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to reorder blocks:', err);
    }
  };

  const addBlock = async (blockType) => {
    try {
      await api.post('/blocks/', {
        section: section.id,
        block_type: blockType,
      });
      setShowTypeSelector(false);
      await fetchBlocks();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to add block:', err);
    }
  };

  const deleteBlock = async (blockId) => {
    try {
      await api.delete(`/blocks/${blockId}/`);
      setEditingBlock(null);
      await fetchBlocks();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to delete block:', err);
    }
  };

  const saveBlock = async (block) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('section', section.id);
      formData.append('block_type', block.block_type);
      formData.append('order', block.order);
      formData.append('title', block.title || '');
      formData.append('description', block.description || '');
      formData.append('link', block.link || '');
      formData.append('text', block.text || '');
      formData.append('tags', block.tags || '');
      formData.append('timeline_date', block.timeline_date || '');
      formData.append('timeline_title', block.timeline_title || '');
      formData.append('timeline_description', block.timeline_description || '');
      formData.append('embed_url', block.embed_url || '');

      if (block._imageFile) {
        formData.append('image', block._imageFile);
      }
      if (block._fileAttachment) {
        formData.append('file', block._fileAttachment);
      }

      await api.put(`/blocks/${block.id}/`, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditingBlock(null);
      await fetchBlocks();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to save block:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderBlockForm = (block, setBlock) => {
    const type = block.block_type;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Card fields */}
        {type === 'card' && (
          <>
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                className="input-field"
                value={block.title || ''}
                onChange={(e) => setBlock({ ...block, title: e.target.value })}
                placeholder="Card title"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="label" style={{ margin: 0 }}>Description</label>
                <AIAssistant
                  fieldType="description"
                  currentText={block.description || ''}
                  onApply={(val) => setBlock({ ...block, description: val })}
                  role={section.title}
                />
              </div>
              <textarea
                className="textarea-field"
                value={block.description || ''}
                onChange={(e) => setBlock({ ...block, description: e.target.value })}
                placeholder="Card description"
              />
            </div>
            <div>
              <label className="label">Link (optional)</label>
              <input
                type="url"
                className="input-field"
                value={block.link || ''}
                onChange={(e) => setBlock({ ...block, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="label">Image (optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(block.image || block._previewUrl) && (
                  <img
                    src={block._previewUrl || block.image}
                    alt="Preview"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                )}
                <button
                  className="btn-ghost"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  <FiImage size={14} />
                  {block.image ? 'Change' : 'Upload'} Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBlock({
                        ...block,
                        _imageFile: file,
                        _previewUrl: URL.createObjectURL(file),
                      });
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div>
              <label className="label">File Attachment (PDF, DOCX, ZIP, etc.)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {block.file && (
                  <a
                    href={block.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--accent-color)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    View File Attachment
                  </a>
                )}
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`block-file-input-${block.id}`);
                    el?.click();
                  }}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  {block.file ? 'Change File' : 'Upload File'}
                </button>
                <input
                  id={`block-file-input-${block.id}`}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBlock({
                        ...block,
                        _fileAttachment: file,
                      });
                    }
                  }}
                  style={{ display: 'none' }}
                />
                {block._fileAttachment && (
                  <span style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: 600 }}>
                    Selected: {block._fileAttachment.name}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Paragraph fields */}
        {type === 'paragraph' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="label" style={{ margin: 0 }}>Text</label>
              <AIAssistant
                fieldType="description"
                currentText={block.text || ''}
                onApply={(val) => setBlock({ ...block, text: val })}
                role={section.title}
              />
            </div>
            <textarea
              className="textarea-field"
              value={block.text || ''}
              onChange={(e) => setBlock({ ...block, text: e.target.value })}
              placeholder="Write your paragraph here..."
              style={{ minHeight: '120px' }}
            />
          </div>
        )}

        {/* Skills fields */}
        {type === 'skills' && (
          <div>
            <label className="label">Skills (comma-separated)</label>
            <textarea
              className="textarea-field"
              value={block.tags || ''}
              onChange={(e) => setBlock({ ...block, tags: e.target.value })}
              placeholder="JavaScript, React, Python, Django..."
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Separate each skill with a comma
            </p>
          </div>
        )}

        {/* Timeline fields */}
        {type === 'timeline' && (
          <>
            <div>
              <label className="label">Date</label>
              <input
                type="text"
                className="input-field"
                value={block.timeline_date || ''}
                onChange={(e) => setBlock({ ...block, timeline_date: e.target.value })}
                placeholder="e.g., Jan 2024 - Present"
              />
            </div>
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                className="input-field"
                value={block.timeline_title || ''}
                onChange={(e) => setBlock({ ...block, timeline_title: e.target.value })}
                placeholder="Job title or event"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="label" style={{ margin: 0 }}>Description</label>
                <AIAssistant
                  fieldType="bullets"
                  currentText={block.timeline_description || ''}
                  onApply={(val) => setBlock({ ...block, timeline_description: val })}
                  role={section.title}
                />
              </div>
              <textarea
                className="textarea-field"
                value={block.timeline_description || ''}
                onChange={(e) => setBlock({ ...block, timeline_description: e.target.value })}
                placeholder="Describe this experience..."
              />
            </div>
          </>
        )}

        {/* Gallery fields */}
        {type === 'gallery' && (
          <>
            <div>
              <label className="label">Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(block.image || block._previewUrl) && (
                  <img
                    src={block._previewUrl || block.image}
                    alt="Preview"
                    style={{
                      width: '80px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                )}
                <button
                  className="btn-ghost"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  <FiImage size={14} />
                  {block.image ? 'Change' : 'Upload'} Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBlock({
                        ...block,
                        _imageFile: file,
                        _previewUrl: URL.createObjectURL(file),
                      });
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div>
              <label className="label">Caption (optional)</label>
              <input
                type="text"
                className="input-field"
                value={block.title || ''}
                onChange={(e) => setBlock({ ...block, title: e.target.value })}
                placeholder="Image caption"
              />
            </div>
          </>
        )}

        {/* Embed fields */}
        {type === 'embed' && (
          <>
            <div>
              <label className="label">Embed URL</label>
              <input
                type="url"
                className="input-field"
                value={block.embed_url || ''}
                onChange={(e) => setBlock({ ...block, embed_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Use an embeddable URL (e.g., YouTube embed link)
              </p>
            </div>
            <div>
              <label className="label">Title (optional)</label>
              <input
                type="text"
                className="input-field"
                value={block.title || ''}
                onChange={(e) => setBlock({ ...block, title: e.target.value })}
                placeholder="Embed title for accessibility"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading content blocks...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <button className="btn-icon" onClick={onBack}>
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {section.title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage content blocks in this section
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn-accent" onClick={() => setShowTypeSelector(true)} style={{ fontSize: '13px', padding: '8px 16px' }}>
          <FiPlus size={14} />
          Add Block
        </button>
      </div>

      {/* Block type selector modal */}
      <AnimatePresence>
        {showTypeSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '20px',
              padding: '20px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Choose a block type:
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
              }}
            >
              {BLOCK_TYPES.map((bt) => {
                const Icon = bt.icon;
                return (
                  <button
                    key={bt.value}
                    onClick={() => addBlock(bt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-color) 5%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                  >
                    <Icon size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{bt.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              className="btn-ghost"
              onClick={() => setShowTypeSelector(false)}
              style={{ marginTop: '12px', fontSize: '13px', padding: '6px 12px' }}
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocks list */}
      {blocks.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <FiPlus size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', fontWeight: 500 }}>No content blocks yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Click "Add Block" to add content to this section</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={blocks}
          onReorder={handleReorder}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}
        >
          {blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              editingBlock={editingBlock}
              setEditingBlock={setEditingBlock}
              deleteBlock={deleteBlock}
              saveBlock={saveBlock}
              saving={saving}
              renderBlockForm={renderBlockForm}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="toast toast-success"
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiCheck size={16} />
            Block saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
