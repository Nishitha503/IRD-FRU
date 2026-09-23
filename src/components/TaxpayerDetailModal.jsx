import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building,
  Calendar,
  CreditCard,
  AlertTriangle,
  FileText,
  Printer,
  ShieldAlert,
  Coins,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Save,
  UserCheck,
  History,
} from 'lucide-react';

export default function TaxpayerDetailModal({
  record,
  isOpen,
  onClose,
  onGenerateNotice,
  onSaveRecordEdits,
  activeOfficer,
  onOpenTinHistory,
}) {
  if (!isOpen || !record) return null;

  const [reviewStatus, setReviewStatus] = useState(record.reviewStatus || 'PENDING_REVIEW');
  const [officerNotes, setOfficerNotes] = useState(record.officerNotes || '');
  const [editedNic, setEditedNic] = useState(record.nic || '');

  useEffect(() => {
    if (record) {
      setReviewStatus(record.reviewStatus || 'PENDING_REVIEW');
      setOfficerNotes(record.officerNotes || '');
      setEditedNic(record.nic || '');
    }
  }, [record]);

  const handleSave = () => {
    onSaveRecordEdits({
      ...record,
      reviewStatus,
      officerNotes,
      nic: editedNic,
      lastReviewedBy: activeOfficer ? `${activeOfficer.name} (${activeOfficer.designation})` : record.lastReviewedBy,
      lastReviewedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{record.name}</h3>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                  {record.id}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Assigned to: <strong style={{ color: 'var(--text-primary)' }}>{record.regionalOffice}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Row: Key Indicators & Risk Score */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TIN Status</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: record.hasTIN ? '#34d399' : '#f87171', marginTop: '2px' }}>
                {record.hasTIN ? `Active: ${record.tin}` : 'FORCED REG REQUIRED'}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Turnover</div>
              <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', marginTop: '2px' }}>
                LKR {record.totalTurnover.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Level</div>
              <div style={{ marginTop: '4px' }}>
                <span className={`badge ${record.riskLevel === 'CRITICAL' ? 'badge-critical' : record.riskLevel === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                  {record.riskLevel} (Score: {record.riskScore})
                </span>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Tax Liability</div>
              <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '2px' }}>
                LKR {Math.round(record.estimatedExposure?.total || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Sri Lankan NIC Analyzer Box */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CreditCard size={18} color="var(--accent-gold)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Sri Lankan National Identity Card (NIC) Analysis</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NIC Number</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{record.nic || 'Not Provided'}</div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NIC Format</label>
                <div>
                  {record.nicDetails?.isValid ? (
                    <span className="badge badge-low">{record.nicDetails.format}</span>
                  ) : (
                    <span className="badge badge-critical">Invalid Format</span>
                  )}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calculated DOB</label>
                <div style={{ fontWeight: 600 }}>{record.nicDetails?.dob || 'N/A'}</div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gender & Age</label>
                <div style={{ fontWeight: 600 }}>
                  {record.nicDetails?.gender ? `${record.nicDetails.gender}, ${record.nicDetails.age} Years` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Demographics */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Contact & Regional Allocation</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <MapPin size={14} /> Registered Address
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{record.address || 'N/A'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Building size={14} /> Assigned IRD Regional Office
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{record.regionalOffice} ({record.regionalCode})</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Phone size={14} /> Contact Phone
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{record.phone || 'N/A'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Mail size={14} /> Email Address
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{record.email || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Aggregated Raw Transactions */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
              Aggregated Source Transactions ({record.transactions?.length || 0})
            </h4>
            <div className="table-wrapper">
              <table className="master-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Agency Source</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount (LKR)</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(record.transactions || []).map((tx, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="badge badge-medium">{tx.agency}</span>
                      </td>
                      <td>{tx.category}</td>
                      <td>{tx.date || 'N/A'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {tx.amount.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tx.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Uploaded Excel Columns Inspection */}
          {record.rawRow && Object.keys(record.rawRow).length > 0 && (
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} color="var(--accent-gold)" />
                  Original Input Excel Columns ({Object.keys(record.rawRow).length} Fields Preserved)
                </h4>
                <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                  Source: {record.primaryAgency || 'Uploaded File'}
                </span>
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <table className="master-table" style={{ fontSize: '11.5px', margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40%', padding: '6px 10px' }}>Original Excel Column Header</th>
                      <th style={{ padding: '6px 10px' }}>Value in Uploaded File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(record.rawRow).map(([colName, colVal], idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-secondary)', padding: '5px 10px' }}>{colName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', padding: '5px 10px' }}>
                          {colVal !== undefined && colVal !== null && String(colVal).trim() !== '' ? String(colVal) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Officer Action & Notes */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Officer Review & Audit Notes</h4>
              {record.lastReviewedBy && (
                <div style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={13} /> Last updated by: <strong>{record.lastReviewedBy}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Review Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="APPROVED_FOR_NOTICE">Approved for Section 102 Notice</option>
                  <option value="INVESTIGATED">Field Investigated</option>
                  <option value="EXCLUDED">Excluded / Exempt</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Investigation Notes / Remarks</label>
                <input
                  type="text"
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g., Physical visit scheduled; Bank branch contacted..."
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {onOpenTinHistory && (
              <button
                type="button"
                onClick={() => {
                  onOpenTinHistory(record.tin || record.nic || record.id);
                  onClose();
                }}
                className="btn btn-outline btn-sm"
                style={{
                  color: '#fde047',
                  borderColor: 'rgba(212, 175, 55, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                <History size={14} />
                <span>🔍 6-Month Historical Investigation</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onGenerateNotice(record)}
              className="btn btn-blue btn-sm"
            >
              <Printer size={14} />
              <span>Generate Statutory Section 102 Notice</span>
            </button>
            <button onClick={handleSave} className="btn btn-primary btn-sm">
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
