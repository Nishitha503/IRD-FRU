import React, { useState } from 'react';
import {
  FileSpreadsheet,
  DownloadCloud,
  FileCheck,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportMasterExcelFile, exportCleanOriginalExcelFile } from '../utils/excelProcessor';

export default function ExportPanel({
  records,
  summary,
  onReset,
  fileName,
  originalHeaders = [],
  rawRows = [],
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingClean, setIsExportingClean] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const outName = `IRD_Forced_Registration_Master_File_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportMasterExcelFile(records, summary, outName, originalHeaders, rawRows);
        setExportedSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        alert('Export failed: ' + err.message);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  const handleExportCleanOriginal = () => {
    setIsExportingClean(true);
    setTimeout(() => {
      try {
        const outName = `IRD_Clean_Original_Dataset_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportCleanOriginalExcelFile(records, outName, originalHeaders, rawRows);
        setExportedSuccess(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        alert('Export failed: ' + err.message);
      } finally {
        setIsExportingClean(false);
      }
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Card */}
      <div className="glass-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
              border: '2px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
            }}
          >
            <DownloadCloud size={36} />
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
              Final Master File Ready for Export
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Successfully analyzed and consolidated <strong style={{ color: 'var(--text-primary)' }}>{records.length} unique taxpayer entities</strong> from input file <strong style={{ color: 'var(--accent-gold)' }}>{fileName || 'data.xlsx'}</strong>.
            </p>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontSize: '12.5px', fontWeight: 600 }}>
                <CheckCircle2 size={15} />
                <span>ඔබ Upload කළ Excel ගොනුවේ පැවති සියලුම Columns ({originalHeaders?.length || 'All'} Original Columns) ඒ ආකාරයෙන්ම සුරක්ෂිතව අන්තර්ගතයි.</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--accent-emerald)', marginTop: '8px' }}>
              (Master File එක සූදානම් කර ඇත - පහතින් බාගත කරගන්න)
            </p>
          </div>

          {/* Export Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '440px', margin: '0 auto' }}>
            <button
              onClick={handleExportExcel}
              disabled={isExporting || isExportingClean}
              className="btn btn-primary btn-lg pulse-glow"
              style={{ width: '100%', gap: '12px', justifyContent: 'center' }}
            >
              <FileSpreadsheet size={22} />
              <span>{isExporting ? 'Generating Multi-Tab Excel...' : 'Download Master Audit File (.xlsx)'}</span>
            </button>

            <button
              onClick={handleExportCleanOriginal}
              disabled={isExporting || isExportingClean}
              className="btn btn-outline btn-md"
              style={{
                width: '100%',
                gap: '10px',
                justifyContent: 'center',
                borderColor: 'rgba(16, 185, 129, 0.6)',
                color: '#6ee7b7',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.08)',
              }}
              title="Download consolidated dataset with ONLY original columns (zero extra columns)"
            >
              <DownloadCloud size={18} />
              <span>{isExportingClean ? 'Preparing Clean File...' : 'Download Clean Original Columns (.xlsx) (මුල් Columns පමණි)'}</span>
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            💡 <strong>මුල් Columns පමණක් අවශ්‍ය නම්:</strong> දෙවන බොත්තම (Clean Original Columns) මඟින් කිසිදු අමතර IRD column එකක් රහිතව මුල් columns පමණක් බාගත කරගත හැක.
          </div>

          {exportedSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#34d399',
                fontSize: '13px',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Excel file downloaded successfully to your computer!</span>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown of What is Inside the Master Excel File */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Layers size={20} color="var(--accent-gold)" />
          <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
            What is Included in the Generated Multi-Tab Master Excel File:
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              <span className="badge badge-medium">Tab 1</span>
              <span>1. Master Register (Original)</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              All original columns from your uploaded Excel file preserved in exact order, plus IRD Cleaned NIC, DOB, Gender, Age, TIN Status, and Exposure.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              <span className="badge badge-low">Tab 2</span>
              <span>2. Source Rows Audited</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Every single uploaded raw transaction with its original columns intact + matching IRD Risk, TIN Status, and Action.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              <span className="badge badge-critical">Tab 3</span>
              <span>3. Actionable Forced Notices</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Prioritized high-risk cases ready for Section 102 statutory notice dispatch.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              <span className="badge badge-purple">Tab 4</span>
              <span>4. VAT & SSCL Breaches</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Commercial entities with turnover exceeding LKR 60M (VAT) and LKR 120M (SSCL).
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              <span className="badge badge-high">Tab 5</span>
              <span>5. Data Exceptions</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Invalid NIC numbers or incomplete addresses requiring physical field inspection.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              <span className="badge badge-neutral">Tab 6</span>
              <span>6. Executive Statistics</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              High-level department KPIs and statutory compliance summary metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Start New Analysis Reset */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <button onClick={onReset} className="btn btn-outline btn-md">
          <RefreshCw size={16} />
          <span>Process Another Excel Data File</span>
        </button>
      </div>
    </div>
  );
}
