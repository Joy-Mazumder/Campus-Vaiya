import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  User as UserIcon, Camera, Shield, Save, Linkedin, Github,
  Facebook, Target, BookOpen, Zap, Briefcase, Mail, Lock,
  ImagePlus, X, Check, Sparkles
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────── */

const Section = ({ title, icon, accent = '#6366f1', children }) => (
  <div style={{
    background: 'rgba(15,17,30,0.7)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '24px',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: '2px',
      background: `linear-gradient(90deg, ${accent}88, transparent)`,
    }} />
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      marginBottom: '20px', paddingBottom: '14px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: `${accent}22`,
        border: `1px solid ${accent}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
      }}>{title}</span>
    </div>
    {children}
  </div>
);

const Field = ({ label, icon, children }) => (
  <div style={{ marginBottom: '14px' }}>
    {label && (
      <label style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        marginBottom: '6px', paddingLeft: '2px',
      }}>
        {icon && <span style={{ opacity: 0.6 }}>{icon}</span>}
        {label}
      </label>
    )}
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#e2e8f0',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, background 0.2s',
};

const InputField = ({ label, icon, type = 'text', placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} icon={icon}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
          background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.04)',
        }}
      />
    </Field>
  );
};

const TextAreaField = ({ label, placeholder, value, onChange, rows = 3 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          resize: 'none',
          lineHeight: '1.6',
          borderColor: focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
          background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.04)',
        }}
      />
    </Field>
  );
};

const SocialField = ({ label, icon, prefix, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} icon={icon}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <span style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRight: 'none',
          borderRadius: '12px 0 0 12px',
          padding: '10px 10px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center',
        }}>{prefix}</span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            borderRadius: '0 12px 12px 0',
            flex: 1,
            borderColor: focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
            background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.04)',
          }}
        />
      </div>
    </Field>
  );
};

const StatBadge = ({ label, value, color }) => (
  <div style={{
    background: 'rgba(15,17,30,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '10px 18px',
    textAlign: 'center',
    backdropFilter: 'blur(20px)',
    minWidth: '90px',
  }}>
    <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '18px', fontWeight: 800, color }}>{value}</div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

const MyProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    bio: user?.bio || '',
    careerGoal: user?.careerGoal || '',
    currentClass: user?.currentClass || '',
    totalSemesters: user?.totalSemesters || '',
    specialities: user?.specialities?.join(', ') || '',
    skills: user?.skills?.join(', ') || '',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    facebook: user?.socialLinks?.facebook || '',
    availableForHelp: user?.helpSettings?.available ?? true,
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  // Cover photo — local preview only, not sent to DB
  const [coverPreview, setCoverPreview] = useState(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        careerGoal: user.careerGoal || '',
        currentClass: user.currentClass || '',
        totalSemesters: user.totalSemesters || '',
        specialities: Array.isArray(user.specialities) ? user.specialities.join(', ') : '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        facebook: user.socialLinks?.facebook || '',
        availableForHelp: user.helpSettings?.available ?? true,
      }));
      setAvatarPreview(user.profilePic || null);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#080a14',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading profile…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeCover = () => {
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));
  const setCheck = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'password' && !formData[key]) return;
      data.append(key, formData[key]);
    });
    if (selectedAvatarFile) data.append('profilePic', selectedAvatarFile);
    // coverPreview is local-only, not appended to FormData

    try {
      const res = await API.put('/users/update', data);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setFormData(prev => ({ ...prev, password: '' }));
      toast.success('Profile synchronized! ✦');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3730a3&color=a5b4fc&bold=true&size=200`;

  /* ── inline keyframes injected once ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); } }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 28px; }
    @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .profile-grid { grid-template-columns: 1fr; } .field-row { grid-template-columns: 1fr; } }
    .cover-hover-btn { opacity: 0; transition: opacity 0.2s; }
    .cover-wrap:hover .cover-hover-btn { opacity: 1; }
    input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.18); }
    input:focus, textarea:focus { outline: none; }
    .toggle-knob { transition: transform 0.25s cubic-bezier(.4,0,.2,1), background 0.25s; }
    .save-btn:hover { background: linear-gradient(135deg, #4f46e5, #7c3aed) !important; transform: translateY(-1px); box-shadow: 0 12px 40px rgba(99,102,241,0.4) !important; }
    .save-btn:active { transform: translateY(0); }
    .avatar-overlay { opacity: 0; transition: opacity 0.2s; }
    .avatar-wrap:hover .avatar-overlay { opacity: 1; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{
        minHeight: '100vh',
        background: '#080a14',
        paddingBottom: '80px',
        animation: 'fadeUp 0.5s ease both',
      }}>

        {/* ── COVER PHOTO AREA ── */}
        <div className="cover-wrap" style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
          {/* Cover image or default gradient */}
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #0d0628 0%, #1a0a4a 25%, #0e1a5c 55%, #0a2d6b 80%, #071a3e 100%)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative orbs */}
              {[
                { w: 500, h: 500, top: '-200px', left: '-100px', color: 'rgba(99,102,241,0.12)' },
                { w: 350, h: 350, top: '-80px', right: '5%', color: 'rgba(139,92,246,0.1)' },
                { w: 250, h: 250, bottom: '-80px', left: '40%', color: 'rgba(6,182,212,0.08)' },
                { w: 180, h: 180, top: '20px', right: '30%', color: 'rgba(244,114,182,0.07)' },
              ].map((o, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: o.w, height: o.h,
                  top: o.top, left: o.left, right: o.right, bottom: o.bottom,
                  borderRadius: '50%',
                  background: o.color,
                  filter: 'blur(60px)',
                }} />
              ))}
              {/* Grid overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }} />
            </div>
          )}

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
            background: 'linear-gradient(transparent, #080a14)',
          }} />

          {/* Cover actions */}
          <div className="cover-hover-btn" style={{
            position: 'absolute', top: '16px', right: '16px',
            display: 'flex', gap: '8px',
          }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(10,12,24,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
              padding: '8px 14px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, color: '#e2e8f0',
            }}>
              <ImagePlus size={14} />
              {coverPreview ? 'Change cover' : 'Add cover photo'}
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
            </label>
            {coverPreview && (
              <button onClick={removeCover} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
                padding: '8px 12px', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, color: '#fca5a5',
              }}>
                <X size={13} /> Remove
              </button>
            )}
          </div>

          {/* Cover hint always visible when no cover */}
          {!coverPreview && (
            <label style={{
              position: 'absolute', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(10,12,24,0.6)', backdropFilter: 'blur(12px)',
              border: '1px dashed rgba(99,102,241,0.35)', borderRadius: '10px',
              padding: '8px 16px', cursor: 'pointer',
              fontSize: '11px', letterSpacing: '0.06em', color: 'rgba(165,180,252,0.7)',
            }}>
              <ImagePlus size={13} />
              Click to add a cover photo (preview only)
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
            </label>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <form onSubmit={handleUpdate} style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>

          {/* Profile header row */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px', marginTop: '-72px', marginBottom: '36px',
          }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div className="avatar-wrap" style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '140px', height: '140px', borderRadius: '50%',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                  boxShadow: '0 0 0 4px #080a14, 0 0 30px rgba(99,102,241,0.4)',
                  animation: 'pulse-glow 3s ease-in-out infinite',
                }}>
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#1e1b4b', display: 'block' }}
                  />
                </div>
                <label className="avatar-overlay" style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', gap: '4px',
                }}>
                  <Camera size={20} color="#fff" />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>Change</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </label>
                {/* Online dot */}
                <div style={{
                  position: 'absolute', bottom: '8px', right: '8px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#22c55e', border: '3px solid #080a14',
                  boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                }} />
              </div>

              {/* Name & badges */}
              <div style={{ paddingBottom: '8px' }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '32px', fontWeight: 800,
                  color: '#f1f5f9', lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}>
                  {formData.fullName || user?.fullName || 'Your Name'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {[
                    { label: user?.badge || 'Scholar', bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
                    { label: `✦ Rep ${user?.reputationPoints || 0}`, bg: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
                    { label: formData.availableForHelp ? '⬤ Mentoring' : '○ Offline', bg: formData.availableForHelp ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', color: formData.availableForHelp ? '#86efac' : 'rgba(255,255,255,0.3)', border: formData.availableForHelp ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)' },
                  ].map((b, i) => (
                    <span key={i} style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 12px',
                      borderRadius: '20px', background: b.bg, color: b.color,
                      border: `1px solid ${b.border}`, letterSpacing: '0.03em',
                    }}>{b.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stat badges */}
            <div style={{ display: 'flex', gap: '10px', paddingBottom: '8px' }}>
              <StatBadge label="Rank" value={`#${user?.rank || 'N/A'}`} color="#fbbf24" />
              <StatBadge label="Level" value={user?.educationLevel || 'N/A'} color="#22d3ee" />
            </div>
          </div>

          {/* ── FORM GRID ── */}
          <div className="profile-grid">

            {/* COL 1 — Account + Academic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Section title="Account & Security" accent="#ef4444" icon={<Shield size={14} />}>
                <InputField
                  label="Email address" icon={<Mail size={11} />} type="email"
                  value={formData.email} onChange={set('email')}
                />
                <InputField
                  label="New password" icon={<Lock size={11} />} type="password"
                  placeholder="Leave blank to keep current"
                  value={formData.password} onChange={set('password')}
                />
              </Section>

              <Section title="Academic" accent="#8b5cf6" icon={<BookOpen size={14} />}>
                <div className="field-row">
                  <InputField label="Current year" type="number" value={formData.currentClass} onChange={set('currentClass')} />
                  <InputField label="Total semesters" type="number" value={formData.totalSemesters} onChange={set('totalSemesters')} />
                </div>
              </Section>
            </div>

            {/* COL 2 — Identity + Networking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Section title="Identity" accent="#6366f1" icon={<UserIcon size={14} />}>
                <InputField
                  label="Full name"
                  value={formData.fullName}
                  onChange={set('fullName')}
                />
                <TextAreaField
                  label="Bio / Headline"
                  placeholder="Tell us about yourself…"
                  value={formData.bio}
                  onChange={set('bio')}
                />
                <InputField
                  label="Career goal" icon={<Target size={11} />}
                  placeholder="e.g. ML Engineer"
                  value={formData.careerGoal}
                  onChange={set('careerGoal')}
                />
              </Section>

              <Section title="Networking" accent="#10b981" icon={<Briefcase size={14} />}>
                <SocialField label="GitHub" icon={<Github size={11} />} prefix="github.com/" value={formData.github} onChange={set('github')} />
                <SocialField label="LinkedIn" icon={<Linkedin size={11} />} prefix="linkedin.com/in/" value={formData.linkedin} onChange={set('linkedin')} />
                <SocialField label="Facebook" icon={<Facebook size={11} />} prefix="fb.com/" value={formData.facebook} onChange={set('facebook')} />
              </Section>
            </div>

            {/* COL 3 — Expertise + Mentor toggle + Completeness */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Section title="Expertise" accent="#f59e0b" icon={<Zap size={14} />}>
                <TextAreaField
                  label="Specialities"
                  placeholder="Comma separated e.g. ML, DSA, Web Dev"
                  value={formData.specialities}
                  onChange={set('specialities')}
                />
                <TextAreaField
                  label="Technical skills"
                  placeholder="React, Python, Node.js, Docker…"
                  value={formData.skills}
                  onChange={set('skills')}
                />

                {/* Mentor toggle */}
                <div style={{
                  marginTop: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: formData.availableForHelp ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${formData.availableForHelp ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '14px', padding: '14px 16px',
                  transition: 'all 0.3s',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Mentor mode</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Allow help requests from peers</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.availableForHelp}
                      onChange={setCheck('availableForHelp')}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: formData.availableForHelp ? '#22c55e' : 'rgba(255,255,255,0.12)',
                      borderRadius: '24px', transition: 'background 0.25s',
                    }}>
                      <div className="toggle-knob" style={{
                        position: 'absolute', top: '3px',
                        left: formData.availableForHelp ? '23px' : '3px',
                        width: '18px', height: '18px',
                        borderRadius: '50%', background: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        transition: 'left 0.25s cubic-bezier(.4,0,.2,1)',
                      }} />
                    </div>
                  </label>
                </div>
              </Section>

              {/* Profile completeness card */}
              <div style={{
                background: 'rgba(15,17,30,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '20px',
                backdropFilter: 'blur(20px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={14} color="#f59e0b" />
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    Profile strength
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                    {Math.min(100, [formData.fullName, formData.bio, formData.careerGoal, formData.skills, formData.github, formData.linkedin, formData.specialities, coverPreview].filter(Boolean).length * 13)}%
                  </span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, [formData.fullName, formData.bio, formData.careerGoal, formData.skills, formData.github, formData.linkedin, formData.specialities, coverPreview].filter(Boolean).length * 13)}%`,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'Full name', done: !!formData.fullName },
                    { label: 'Bio written', done: !!formData.bio },
                    { label: 'Career goal', done: !!formData.careerGoal },
                    { label: 'Skills added', done: !!formData.skills },
                    { label: 'Cover photo', done: !!coverPreview },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: item.done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${item.done ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                        {item.done && <Check size={9} color="#86efac" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '11px', color: item.done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', textDecoration: item.done ? 'line-through' : 'none' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── SAVE BUTTON ── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            marginTop: '32px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <button
              type="submit"
              disabled={loading}
              className="save-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '13px 32px', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
                transition: 'all 0.2s',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              {loading ? (
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.25)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                <Save size={15} />
              )}
              {loading ? 'Synchronizing…' : 'Update all records'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MyProfile;