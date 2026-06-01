import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axiosConfig';
import { FiUser, FiCamera, FiSave, FiCheck } from 'react-icons/fi';

export default function ProfileEditor({ onSaved }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/');
      setProfile(res.data);
      setPreviewUrl(res.data.profile_pic);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setProfile((prev) => ({ ...prev, _imageFile: file }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('custom_intro', profile.custom_intro || "Hello, I'm");
      formData.append('role', profile.role || '');
      formData.append('location', profile.location || '');
      formData.append('tagline', profile.tagline || '');
      formData.append('show_profile_pic', profile.show_profile_pic);
      if (profile._imageFile) {
        formData.append('profile_pic', profile._imageFile);
      }

      await api.put('/profile/', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '600px' }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <FiUser size={20} />
        Profile Settings
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Picture */}
        <div>
          <label className="label">Profile Picture</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-elevated)',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FiUser size={28} style={{ color: 'var(--text-muted)' }} />
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity var(--transition-fast)',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = 1)}
                onMouseLeave={(e) => (e.target.style.opacity = 0)}
              >
                <FiCamera size={20} style={{ color: '#fff' }} />
              </div>
            </div>
            <div>
              <button
                className="btn-ghost"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                <FiCamera size={14} />
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Show profile pic toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Show Profile Picture
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Display your photo on the portfolio
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={profile.show_profile_pic}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, show_profile_pic: e.target.checked }))
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Custom Intro Prefix */}
        <div>
          <label className="label">Intro Prefix</label>
          <input
            type="text"
            className="input-field"
            value={profile.custom_intro || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev, custom_intro: e.target.value }))}
            placeholder="e.g., Hello, I'm"
          />
        </div>

        {/* Name */}
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            className="input-field"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="label">Professional Role</label>
          <input
            type="text"
            className="input-field"
            value={profile.role || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., Full Stack Engineer"
          />
        </div>

        {/* Location */}
        <div>
          <label className="label">Location</label>
          <input
            type="text"
            className="input-field"
            value={profile.location || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., London, UK"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="label">Short Bio / Tagline</label>
          <input
            type="text"
            className="input-field"
            value={profile.tagline || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev, tagline: e.target.value }))}
            placeholder="A short tagline or summary"
          />
        </div>

        {/* Save Button */}
        <button
          className="btn-accent"
          onClick={handleSave}
          disabled={saving}
          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
        >
          {saved ? (
            <>
              <FiCheck size={16} />
              Saved!
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            <>
              <FiSave size={16} />
              Save Profile
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
