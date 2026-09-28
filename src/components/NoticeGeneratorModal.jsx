import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Building2, ShieldAlert, CheckCircle } from 'lucide-react';
import { downloadNoticePDF } from '../utils/pdfGenerator';

export default function NoticeGeneratorModal({ record, isOpen, onClose, activeOfficer }) {
  if (!isOpen || !record) return null;

  const defaultOfficer = activeOfficer
    ? `${activeOfficer.name} (${activeOfficer.designation})`
    : 'Senior Assessor / Assistant Commissioner';

  const [officerName, setOfficerName] = useState(defaultOfficer);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (activeOfficer) {
      setOfficerName(`${activeOfficer.name} (${activeOfficer.designation})`);
    }
  }, [activeOfficer]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      downloadNoticePDF(record, officerName);
      setIsGenerating(false);
    }, 400);
  };

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const referenceNo = `IRD/FRB/${new Date().getFullYear()}/${record.id || 'REF-001'}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={20} color="var(--accent-gold)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                Section 102 Compulsory Registration Statutory Notice
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Inland Revenue Act No. 24 of 2017 (Inland Revenue Department Sri Lanka)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Officer Config */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Issuing Assessing Officer Details (Auto-filled from Active Profile)</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          {/* Letterhead Preview Box */}
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '8px',
              padding: '24px',
              fontFamily: 'serif',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2a4a', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2a4a', margin: 0, textTransform: 'uppercase' }}>
                Department of Inland Revenue • Sri Lanka
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                FORCED REGISTRATION UNIT | CENTRAL REVENUE OPERATIONS
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                Sir Chittampalam A. Gardiner Mawatha, Colombo 02 • Hotline: 1944 • Web: www.ird.gov.lk
              </div>
            </div>

            {/* Reference */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '14px', fontFamily: 'sans-serif' }}>
              <div><strong>Notice Ref:</strong> {referenceNo}</div>
              <div><strong>Date:</strong> {todayStr}</div>
            </div>

            {/* Recipient */}
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', marginBottom: '14px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}>
              <div><strong>TO:</strong> {record.name}</div>
              <div><strong>NIC / BRN:</strong> {record.nic || record.brn || 'N/A'}</div>
              <div><strong>Address:</strong> {record.address || 'Address on record'}</div>
              <div><strong>Assigned Regional Office:</strong> {record.regionalOffice}</div>
            </div>

            {/* Notice Title */}
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', color: '#991b1b', marginBottom: '12px', textDecoration: 'underline' }}>
              NOTICE OF COMPULSORY REGISTRATION UNDER SECTION 102 OF THE INLAND REVENUE ACT NO. 24 OF 2017
            </div>

            {/* Body */}
            <p style={{ marginBottom: '10px', textAlign: 'justify' }}>
              WHEREAS statutory intelligence records from <strong>{record.primaryAgency}</strong> indicate that you have engaged in financial / commercial transactions amounting to <strong>LKR {(record.totalTurnover || 0).toLocaleString()}</strong>;
            </p>
            <p style={{ marginBottom: '10px', textAlign: 'justify' }}>
              AND WHEREAS you are mandatorily required to register for <strong>{[!record.hasTIN ? 'TIN' : null, record.isVatBreached ? 'VAT' : null, record.isSsclBreached ? 'SSCL' : null].filter(Boolean).join(' and ')}</strong> with the Department of Inland Revenue;
            </p>
            <p style={{ marginBottom: '10px', color: '#991b1b', fontWeight: 700 }}>
              YOU ARE HEREBY DIRECTED TO REGISTER VIA THE IRD E-SERVICES PORTAL OR REPORT TO THE ASSIGNED REGIONAL OFFICE WITHIN FOURTEEN (14) DAYS OF THIS NOTICE.
            </p>

            {/* Signatory */}
            <div style={{ marginTop: '24px', textAlign: 'right', fontSize: '11px', fontFamily: 'sans-serif' }}>
              <div style={{ fontWeight: 700 }}>For Commissioner-General of Inland Revenue</div>
              <div>{officerName}</div>
              <div>Forced Registration Unit</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Close
          </button>
          <button onClick={handleDownload} disabled={isGenerating} className="btn btn-primary btn-sm">
            <Download size={14} />
            <span>{isGenerating ? 'Generating PDF...' : 'Download Official PDF Notice'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
