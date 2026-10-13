import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  X,
  Check,
  Shield,
  Edit2,
  Trash2,
  Building,
  Mail,
  Phone,
  Briefcase,
  Key,
  BadgeCheck,
} from 'lucide-react';
import { DISTRICT_REGIONAL_OFFICES } from '../utils/districtMapping';

export default function UserProfileModal({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  onSelectProfile,
  onSaveProfiles,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    serviceNo: '',
    designation: 'Tax Assessor - Investigation',
    role: 'ASSESSOR',
    regionalOffice: 'Head Office - Forced Registration Branch, Colombo 02',
    regionalCode: 'HQ-FRU',
    email: '',
    phone: '',
    canApproveNotices: true,
    canEditRules: false,
    badgeColor: '#3b82f6',
  });

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setFormData({
      name: '',
      serviceNo: `IRD-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: 'Tax Assessor - Investigation',
      role: 'ASSESSOR',
      regionalOffice: 'Head Office - Forced Registration Branch, Colombo 02',
      regionalCode: 'HQ-FRU',
      email: '',
      phone: '',
      canApproveNotices: true,
      canEditRules: false,
      badgeColor: '#3b82f6',
    });
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (p) => {
    setFormData({ ...p });
    setEditingId(p.id);
    setIsCreating(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert('Cannot delete the only officer profile.');
      return;
    }
    if (confirm('Are you sure you want to remove this officer profile?')) {
      const updated = profiles.filter((p) => p.id !== id);
      onSaveProfiles(updated);
      if (activeProfile?.id === id) {
        onSelectProfile(updated[0]);
      }
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter officer name.');
      return;
    }

    if (editingId) {
      const updated = profiles.map((p) =>
        p.id === editingId ? { ...formData, id: editingId } : p
      );
      onSaveProfiles(updated);
      if (activeProfile?.id === editingId) {
        onSelectProfile({ ...formData, id: editingId });
      }
    } else {
      const newProfile = {
        ...formData,
        id: `OFF-${String(profiles.length + 1).padStart(3, '0')}`,
      };
      const updated = [...profiles, newProfile];
      onSaveProfiles(updated);
      onSelectProfile(newProfile);
    }

    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                Office User & Officer Profiles Management
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                නිලධාරි පැතිකඩ කළමනාකරණය • Manage assessing officers & switch active session
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!isCreating ? (
            <>
              {/* Top Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Active Officer: <strong style={{ color: 'var(--accent-gold)' }}>{activeProfile?.name}</strong> ({activeProfile?.designation})
                </div>
                <button onClick={handleStartCreate} className="btn btn-primary btn-sm">
                  <UserPlus size={14} />
                  <span>Add New Officer Profile</span>
                </button>
              </div>

              {/* Profiles List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profiles.map((p) => {
                  const isActive = activeProfile?.id === p.id;
                  const initials = p.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProfile(p)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        background: isActive ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Avatar */}
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: p.badgeColor || '#3b82f6',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {initials}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                              {p.name}
                            </span>
                            <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                              {p.serviceNo}
                            </span>
                            {isActive && (
                              <span className="badge badge-high" style={{ fontSize: '9px' }}>
                                Active User
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {p.designation}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                            <span>📍 {p.regionalOffice}</span>
                            {p.email && <span>✉️ {p.email}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isActive ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#34d399',
                              fontSize: '12px',
                              fontWeight: 700,
                              marginRight: '6px',
                            }}
                          >
                            <Check size={16} /> Selected
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelectProfile(p)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            Switch to this Profile
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(p);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px' }}
                          title="Edit Officer Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(p.id, e)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Remove Profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                  {editingId ? 'Edit Officer Profile' : 'Create New Office User Profile'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-ghost btn-sm"
                >
                  ← Back to List
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name of Officer *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. S. M. Gunasekara"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Service / Staff ID *</label>
                  <input
                    type="text"
                    value={formData.serviceNo}
                    onChange={(e) => setFormData({ ...formData, serviceNo: e.target.value })}
                    placeholder="e.g. IRD-EMP-7782"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Designation / Title</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Assessor / Tax Officer"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="SENIOR_ASSESSOR">Senior Assessor / Assistant Commissioner</option>
                    <option value="ASSESSOR">Tax Assessor / Field Investigator</option>
                    <option value="DATA_ANALYST">Revenue Intelligence Analyst</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assigned IRD Office / Division</label>
                <select
                  value={formData.regionalOffice}
                  onChange={(e) => setFormData({ ...formData, regionalOffice: e.target.value })}
                  className="form-select"
                >
                  <option value="Head Office - Forced Registration Branch, Colombo 02">
                    Head Office - Forced Registration Branch, Colombo 02
                  </option>
                  <option value="Metro Corporate / Colombo Regional Office">
                    Metro Corporate / Colombo Regional Office
                  </option>
                  <option value="Gampaha Regional Office">Gampaha Regional Office</option>
                  <option value="Kalutara Regional Office">Kalutara Regional Office</option>
                  <option value="Kandy Regional Office">Kandy Regional Office</option>
                  <option value="Galle Regional Office">Galle Regional Office</option>
                  <option value="Kurunegala Regional Office">Kurunegala Regional Office</option>
                  <option value="Ratnapura Regional Office">Ratnapura Regional Office</option>
                  <option value="Jaffna Regional Office">Jaffna Regional Office</option>
                  <option value="Anuradhapura Regional Office">Anuradhapura Regional Office</option>
                  <option value="Matara Regional Office">Matara Regional Office</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@ird.gov.lk"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Phone / Extension</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="011-2135600"
                    className="form-control"
                  />
                </div>
              </div>

              {/* Profile Badge Color */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Profile Color Theme</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#06b6d4'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, badgeColor: color })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: color,
                        border: formData.badgeColor === color ? '3px solid #ffffff' : '1px solid transparent',
                        cursor: 'pointer',
                        boxShadow: formData.badgeColor === color ? '0 0 10px ' + color : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={14} />
                  <span>{editingId ? 'Update Officer Profile' : 'Save New Profile'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
