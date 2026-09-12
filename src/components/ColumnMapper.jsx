import React from 'react';
import {
  Columns,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';

export default function ColumnMapper({
  availableHeaders,
  columnMapping,
  setColumnMapping,
  sampleRows,
  onRunAnalysis,
  onBack,
  fileName,
}) {
  const fields = [
    {
      key: 'nic',
      label: 'NIC / National ID (ජාතික හැඳුනුම්පත් අංකය)',
      required: true,
      description: 'Used for Sri Lankan 9-digit / 12-digit validation, DOB, Gender & age calculation',
    },
    {
      key: 'name',
      label: 'Taxpayer / Business Name (නම / ව්‍යාපාර නාමය)',
      required: true,
      description: 'Full name of individual or corporate entity',
    },
    {
      key: 'turnover',
      label: 'Transaction Value / Turnover (ගනුදෙනු වටිනාකම / ආදායම)',
      required: true,
      description: 'CIF Value, transaction amount, vehicle value or annual turnover in LKR',
    },
    {
      key: 'address',
      label: 'Address / Location (ලිපිනය)',
      required: false,
      description: 'Used for automatic IRD Regional Office and Forced Reg Unit assignment',
    },
    {
      key: 'tin',
      label: 'Existing TIN / RAMIS ID (පවතින බදු අංකය)',
      required: false,
      description: 'Used to check if taxpayer is already registered or requires Forced Registration',
    },
    {
      key: 'brn',
      label: 'Business Reg No (BRN / සමාගම් ලියාපදිංචි අංකය)',
      required: false,
      description: 'PV/PB/GA company registration or sole proprietorship registration',
    },
    {
      key: 'agency',
      label: 'Source Agency / Department (දත්ත ලබාදුන් ආයතනය)',
      required: false,
      description: 'Customs, DMT, Banks, Land Registry, CEB, etc.',
    },
    {
      key: 'txDate',
      label: 'Transaction Date / Assessment Year (දිනය)',
      required: false,
      description: 'Date of transaction or import',
    },
    {
      key: 'phone',
      label: 'Contact Phone / Mobile (දුරකථන අංකය)',
      required: false,
      description: 'For notification and investigation contact',
    },
    {
      key: 'email',
      label: 'Email Address (විද්‍යුත් තැපෑල)',
      required: false,
      description: 'For digital notice dispatch',
    },
    {
      key: 'description',
      label: 'Goods / Transaction Description (විස්තරය)',
      required: false,
      description: 'Imported items, vehicle model, nature of business',
    },
  ];

  const handleFieldChange = (key, value) => {
    setColumnMapping((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const isReady = columnMapping.name && (columnMapping.nic || columnMapping.brn || columnMapping.tin);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Columns size={20} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                Dynamic Column Mapping & Data Verification
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Map the columns of <strong style={{ color: 'var(--text-primary)' }}>{fileName}</strong> to the IRD Forced Registration standard data fields.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onBack} className="btn btn-outline btn-sm">
              ← Change File
            </button>
            <button
              onClick={onRunAnalysis}
              disabled={!isReady}
              className="btn btn-primary btn-md pulse-glow"
              style={{
                opacity: isReady ? 1 : 0.6,
                cursor: isReady ? 'pointer' : 'not-allowed',
              }}
            >
              <span>Analyze & Generate Master File</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mapping Grid */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Field Mapping Configuration
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {fields.map((f) => {
            const isMapped = Boolean(columnMapping[f.key]);
            return (
              <div
                key={f.key}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: isMapped ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  border: isMapped ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {f.label}{' '}
                    {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {isMapped ? (
                    <span className="badge badge-low" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      <CheckCircle size={10} /> Mapped
                    </span>
                  ) : f.required ? (
                    <span className="badge badge-critical" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      Required
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      Optional
                    </span>
                  )}
                </div>

                <select
                  value={columnMapping[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Do Not Map / Not Present --</option>
                  {availableHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {f.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Data Preview of First 3 Rows */}
      {sampleRows && sampleRows.length > 0 && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Eye size={18} color="var(--accent-blue)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
              Live Raw Data Sample Preview (First {Math.min(3, sampleRows.length)} Rows)
            </h4>
          </div>

          <div className="table-wrapper">
            <table className="master-table">
              <thead>
                <tr>
                  <th>#</th>
                  {availableHeaders.slice(0, 8).map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.slice(0, 3).map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    {availableHeaders.slice(0, 8).map((h) => (
                      <td key={h} style={{ fontFamily: typeof row[h] === 'number' ? 'var(--font-mono)' : 'inherit' }}>
                        {String(row[h] !== undefined ? row[h] : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
