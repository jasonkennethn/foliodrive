import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import api from '../../api/axiosConfig';
import {
  FiLayers, FiPlus, FiTrash2,
  FiEdit3, FiEye, FiEyeOff, FiCheck, FiX,
} from 'react-icons/fi';

function SectionRow({
  section,
  editingId,
  editTitle,
  setEditTitle,
  saveEdit,
  setEditingId,
  startEditing,
  onSectionSelect,
  toggleVisibility,
  deleteSection,
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={section}
      id={section.id.toString()}
      dragListener={false}
      dragControls={dragControls}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        touchAction: 'none',
      }}
      className="draggable-section-row"
    >
      {/* Drag handle grabber */}
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        style={{
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          transition: 'all var(--transition-fast)',
        }}
        className="drag-handle"
        title="Drag to reorder"
      >
        <svg
          width="12"
          height="18"
          viewBox="0 0 12 18"
          fill="currentColor"
          style={{ opacity: 0.6 }}
        >
          <circle cx="2" cy="3" r="1.5" />
          <circle cx="2" cy="9" r="1.5" />
          <circle cx="2" cy="15" r="1.5" />
          <circle cx="10" cy="3" r="1.5" />
          <circle cx="10" cy="9" r="1.5" />
          <circle cx="10" cy="15" r="1.5" />
        </svg>
      </div>

      {/* Title */}
      <div style={{ flex: 1 }}>
        {editingId === section.id ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="input-field"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit(section)}
              autoFocus
              style={{ padding: '6px 12px', fontSize: '14px' }}
            />
            <button className="btn-icon" onClick={() => saveEdit(section)} style={{ width: '28px', height: '28px' }}>
              <FiCheck size={14} style={{ color: '#22c55e' }} />
            </button>
            <button className="btn-icon" onClick={() => setEditingId(null)} style={{ width: '28px', height: '28px' }}>
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: section.is_visible ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: section.is_visible ? 'none' : 'line-through',
              cursor: 'pointer',
            }}
            onClick={() => startEditing(section)}
          >
            {section.title}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          className="btn-icon"
          onClick={() => onSectionSelect && onSectionSelect(section)}
          title="Manage content blocks"
          style={{ width: '32px', height: '32px' }}
        >
          <FiEdit3 size={14} />
        </button>
        <button
          className="btn-icon"
          onClick={() => toggleVisibility(section)}
          title={section.is_visible ? 'Hide section' : 'Show section'}
          style={{ width: '32px', height: '32px' }}
        >
          {section.is_visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
        </button>
        <button
          className="btn-icon"
          onClick={() => deleteSection(section.id)}
          title="Delete section"
          style={{ width: '32px', height: '32px', color: '#ef4444' }}
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}


export default function SectionManager({ onSectionSelect, onChanged }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections/');
      setSections(res.data);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/sections/', { title: newTitle.trim() });
      setNewTitle('');
      setShowAdd(false);
      await fetchSections();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to add section:', err);
    }
  };

  const addTemplateSection = async (type) => {
    let title = '';
    let blocksToCreate = [];

    if (type === 'general_about') {
      title = 'About Me';
      blocksToCreate = [
        {
          block_type: 'paragraph',
          text: "I am a dedicated professional with a strong commitment to organizational excellence, compliance, and strategic administration. I thrive on collaborating with executive leadership to streamline operations and ensure governance frameworks are maintained at the highest level.",
        }
      ];
    } else if (type === 'general_skills') {
      title = 'Core Skills';
      blocksToCreate = [
        {
          block_type: 'skills',
          tags: "Corporate Administration, Board Facilitation, Minute Drafting, Document Control, Regulatory Filing, Team Collaboration, Digital Communication Tools",
        }
      ];
    } else if (type === 'general_achievements') {
      title = 'Key Achievements';
      blocksToCreate = [
        {
          block_type: 'card',
          title: "Process Modernization",
          description: "Digitized organizational meeting workflows, reducing material prep times by 40% while enhancing data security and compliance audits.",
        },
        {
          block_type: 'card',
          title: "Compliance Management System",
          description: "Implemented a structured calendar management tracker that successfully automated critical regulatory filing deadlines.",
        }
      ];
    } else if (type === 'general_certs') {
      title = 'Certifications & Courses';
      blocksToCreate = [
        {
          block_type: 'timeline',
          timeline_date: "2025",
          timeline_title: "Certified Administrator / Professional Certification",
          timeline_description: "Focused on statutory governance standards, filing regulations, and digital records administration.",
        },
        {
          block_type: 'timeline',
          timeline_date: "2024",
          timeline_title: "Advanced Executive Minutes Workshop",
          timeline_description: "Professional certification course on recording statutory board and committee proceedings.",
        }
      ];
    } else if (type === 'general_socials') {
      title = 'Socials & Contact';
      blocksToCreate = [
        {
          block_type: 'paragraph',
          text: "I am always open to exploring new professional opportunities, consulting roles, or collaboration projects. Get in touch directly.",
        },
        {
          block_type: 'card',
          title: "Send an Email",
          description: "contact@yourdomain.com",
          link: "mailto:contact@yourdomain.com",
        },
        {
          block_type: 'card',
          title: "LinkedIn Profile",
          description: "Connect with me on LinkedIn",
          link: "https://linkedin.com",
        }
      ];
    } else if (type === 'board_secretarial') {
      title = 'Board Secretariat & Admin';
      blocksToCreate = [
        {
          block_type: 'paragraph',
          text: "Specialized in organizing and administering Board of Directors and Committee meetings, ensuring timely circulation of agendas, board portals management, and meticulous drafting of minutes in compliance with corporate statutes.",
        },
        {
          block_type: 'timeline',
          timeline_date: "Ongoing",
          timeline_title: "Board Secretariat Administration",
          timeline_description: "Manage corporate meetings schedule, oversee agenda pre-clearance, compile board books, and record official proceedings for listed boards.",
        }
      ];
    } else if (type === 'governance') {
      title = 'Corporate Governance & Advisory';
      blocksToCreate = [
        {
          block_type: 'paragraph',
          text: "Provide expert guidance to the Board and executive leadership on best practices in corporate governance, legal frameworks, directors' duties, and conflict management to ensure transparent and ethical operations.",
        },
        {
          block_type: 'skills',
          tags: "Companies Act Compliance, Regulatory Disclosures, SEBI/SEC Regulations, Insider Trading Policies, Board Effectiveness Reviews, ESG Reporting, Shareholder Relations",
        }
      ];
    } else if (type === 'filings') {
      title = 'Statutory Registers & Filings';
      blocksToCreate = [
        {
          block_type: 'paragraph',
          text: "Responsible for maintaining all statutory registers (directors, members, charges, transfers) and ensuring the timely filing of annual reports, financial disclosures, and event-based returns with regulatory registries.",
        },
        {
          block_type: 'card',
          title: "Annual Secretarial Returns",
          description: "Filing annual financial statements, corporate declarations, and director disclosures within the statutory timelines.",
        },
        {
          block_type: 'card',
          title: "Share Capital Administration",
          description: "Handling share allocations, transfers, splits, and maintaining the register of members with zero error tolerance.",
        }
      ];
    } else if (type === 'credentials') {
      title = 'Qualifications & Memberships';
      blocksToCreate = [
        {
          block_type: 'timeline',
          timeline_date: "Certified Member",
          timeline_title: "Associate / Fellow Member (ACS / FCS)",
          timeline_description: "Certified member of the Institute of Company Secretaries (e.g. ICSI / Chartered Governance Institute). Authorized to conduct secretarial compliance audits.",
        },
        {
          block_type: 'timeline',
          timeline_date: "Postgraduate Degree",
          timeline_title: "Master of Laws (LL.M.) in Corporate Law",
          timeline_description: "Deep specialization in corporate legal frameworks, mergers and acquisitions, and securities legislation.",
        }
      ];
    } else if (type === 'contact_advisory') {
      title = 'Advisory & Contact';
      blocksToCreate = [
        {
          block_type: 'paragraph',
          text: "Open to governance consulting engagements, independent secretarial audits, and board secretariat advisory services. Get in touch directly.",
        },
        {
          block_type: 'card',
          title: "Email Governance Office",
          description: "secretary@example.com",
          link: "mailto:secretary@example.com",
        },
        {
          block_type: 'card',
          title: "LinkedIn Professional Profile",
          description: "Connect for professional governance advisory inquiries.",
          link: "https://linkedin.com",
        }
      ];
    }

    try {
      setLoading(true);
      // 1. Create section
      const res = await api.post('/sections/', { title });
      const newSection = res.data;

      // 2. Create content blocks sequentially
      for (let i = 0; i < blocksToCreate.length; i++) {
        const block = blocksToCreate[i];
        await api.post('/blocks/', {
          section: newSection.id,
          ...block,
          order: i
        });
      }

      await fetchSections();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to create template section:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id) => {
    try {
      await api.delete(`/sections/${id}/`);
      await fetchSections();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to delete section:', err);
    }
  };

  const toggleVisibility = async (section) => {
    try {
      await api.put(`/sections/${section.id}/`, {
        title: section.title,
        order: section.order,
        is_visible: !section.is_visible,
      });
      await fetchSections();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleReorder = async (newSections) => {
    setSections(newSections);

    try {
      await api.patch('/sections/reorder/', {
        order: newSections.map((s) => s.id),
      });
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to reorder:', err);
      fetchSections();
    }
  };

  const startEditing = (section) => {
    setEditingId(section.id);
    setEditTitle(section.title);
  };

  const saveEdit = async (section) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/sections/${section.id}/`, {
        title: editTitle.trim(),
        order: section.order,
        is_visible: section.is_visible,
      });
      setEditingId(null);
      await fetchSections();
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Failed to update section:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading sections...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FiLayers size={20} />
          Sections
        </h2>
        <div style={{ display: 'flex', gap: '8px', position: 'relative', flexWrap: 'wrap' }}>
          <button
            className="btn-ghost"
            onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            <FiLayers size={14} />
            Recommended Templates
          </button>
          <button className="btn-accent" onClick={() => setShowAdd(true)} style={{ fontSize: '13px', padding: '8px 16px' }}>
            <FiPlus size={14} />
            Add Section
          </button>

          {/* Templates Dropdown menu */}
          <AnimatePresence>
            {showTemplatesDropdown && (
              <>
                <div
                  onClick={() => setShowTemplatesDropdown(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 998,
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '260px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 999,
                    maxHeight: '380px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-elevated)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    General Templates
                  </div>
                  <button
                    onClick={() => { addTemplateSection('general_about'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    About Me
                  </button>
                  <button
                    onClick={() => { addTemplateSection('general_skills'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Core Skills
                  </button>
                  <button
                    onClick={() => { addTemplateSection('general_achievements'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Key Achievements
                  </button>
                  <button
                    onClick={() => { addTemplateSection('general_certs'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Certifications & Courses
                  </button>
                  <button
                    onClick={() => { addTemplateSection('general_socials'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Socials & Contact
                  </button>

                  <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-elevated)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Company Secretary Specialist
                  </div>
                  <button
                    onClick={() => { addTemplateSection('board_secretarial'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Board Secretariat & Admin
                  </button>
                  <button
                    onClick={() => { addTemplateSection('governance'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Corporate Governance & Advisory
                  </button>
                  <button
                    onClick={() => { addTemplateSection('filings'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Statutory Registers & Filings
                  </button>
                  <button
                    onClick={() => { addTemplateSection('credentials'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    CS Memberships & Qualifications
                  </button>
                  <button
                    onClick={() => { addTemplateSection('contact_advisory'); setShowTemplatesDropdown(false); }}
                    className="dropdown-item"
                  >
                    Advisory & Contact
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add section form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '16px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <input
                type="text"
                className="input-field"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='Section name (e.g., "About Me", "Projects")'
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addSection()}
              />
              <button className="btn-accent" onClick={addSection} style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                <FiCheck size={14} />
                Add
              </button>
              <button className="btn-ghost" onClick={() => { setShowAdd(false); setNewTitle(''); }} style={{ padding: '8px 12px' }}>
                <FiX size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections list */}
      {sections.length === 0 ? (
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
          <FiLayers size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', fontWeight: 500 }}>No sections yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Click "Add Section" or select a "Recommended Template" to get started</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              editingId={editingId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              saveEdit={saveEdit}
              setEditingId={setEditingId}
              startEditing={startEditing}
              onSectionSelect={onSectionSelect}
              toggleVisibility={toggleVisibility}
              deleteSection={deleteSection}
            />
          ))}
        </Reorder.Group>
      )}
    </motion.div>
  );
}
