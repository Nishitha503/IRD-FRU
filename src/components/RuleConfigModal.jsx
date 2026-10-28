import React, { useState } from 'react';
import { Sliders, X, RotateCcw, Check, HelpCircle } from 'lucide-react';
import { DEFAULT_RULES } from '../utils/ruleEngine';

export default function RuleConfigModal({ isOpen, onClose, rules, onSaveRules }) {
  const [tempRules, setTempRules] = useState(rules || DEFAULT_RULES);

  if (!isOpen) return null;

  const handleChange = (key, val) => {
    setTempRules((prev) => ({
      ...prev,
      [key]: parseFloat(val) || 0,
    }));
  };

  const handleReset = () => {
    setTempRules(DEFAULT_RULES);
  };

  const handleSave = () => {
    onSaveRules(tempRules);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="var(--accent-gold)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Tax Law Rules & Registration Thresholds</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Configure parameters as per Inland Revenue Act No. 24 of 2017 & Gazette Notifications
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rule 1: Mandatory TIN Age */}
          <div className="form-group">
            <label className="form-label">
              Mandatory TIN Age Requirement (වයස් සීමාව)
            </label>
            <input
              type="number"
              value={tempRules.mandatoryTinAge}
              onChange={(e) => handleChange('mandatoryTinAge', e.target.value)}
              className="form-control"
              min="16"
              max="100"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              All citizens reaching this age must obtain a mandatory Taxpayer Identification Number (TIN).
            </div>
          </div>

          {/* Rule 2: Individual Income Threshold */}
          <div className="form-group">
            <label className="form-label">
              Annual Tax-Free Relief / Income Tax Threshold (LKR / YOA)
            </label>
            <input
              type="number"
              value={tempRules.individualIncomeThreshold}
              onChange={(e) => handleChange('individualIncomeThreshold', e.target.value)}
              className="form-control"
              step="100000"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Currently LKR 1,200,000 per annum (or LKR 100,000 per month).
            </div>
          </div>

          {/* Rule 3: VAT Annual Threshold */}
          <div className="form-group">
            <label className="form-label">
              VAT Registration Annual Threshold (LKR)
            </label>
            <input
              type="number"
              value={tempRules.vatAnnualThreshold}
              onChange={(e) => handleChange('vatAnnualThreshold', e.target.value)}
              className="form-control"
              step="5000000"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Entities with annual turnover exceeding this threshold are compulsory liable for VAT registration.
            </div>
          </div>

          {/* Rule 4: SSCL Threshold */}
          <div className="form-group">
            <label className="form-label">
              Social Security Contribution Levy (SSCL) Annual Threshold (LKR)
            </label>
            <input
              type="number"
              value={tempRules.ssclAnnualThreshold}
              onChange={(e) => handleChange('ssclAnnualThreshold', e.target.value)}
              className="form-control"
              step="10000000"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Currently LKR 120,000,000 per annum (LKR 30,000,000 per quarter).
            </div>
          </div>

          {/* Rates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">VAT Statutory Rate (%)</label>
              <input
                type="number"
                value={tempRules.vatRate * 100}
                onChange={(e) => handleChange('vatRate', (parseFloat(e.target.value) || 0) / 100)}
                className="form-control"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">SSCL Statutory Rate (%)</label>
              <input
                type="number"
                value={tempRules.ssclRate * 100}
                onChange={(e) => handleChange('ssclRate', (parseFloat(e.target.value) || 0) / 100)}
                className="form-control"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleReset} className="btn btn-outline btn-sm">
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-sm">
            <Check size={14} /> Apply & Re-Evaluate
          </button>
        </div>
      </div>
    </div>
  );
}
