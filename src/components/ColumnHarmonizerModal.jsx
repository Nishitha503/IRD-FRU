import React, { useState, useEffect } from 'react';
import {
  Columns,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  ShieldCheck,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { getTranslation } from '../utils/translations';

export default function ColumnHarmonizerModal({
  isOpen,
  onClose,
  parsedFileInfo,
  harmonizerConfig = { strictBaseSchema: true, includeSourceFile: false, excludedColumns: [] },
  onUpdateConfig,
  language = 'si',
}) {
  if (!isOpen) return null;

  const t = getTranslation(language);
  const [strictMode, setStrictMode] = useState(harmonizerConfig.strictBaseSchema ?? true);
  const [includeSourceFile, setIncludeSourceFile] = useState(harmonizerConfig.includeSourceFile ?? false);
  const [excludedList, setExcludedList] = useState(harmonizerConfig.excludedColumns || []);

  const baseColumns = parsedFileInfo?.baseColumns || [];
  const extraDiscovered = parsedFileInfo?.extraColumnsDiscovered || [];
  const allAvailableColumns = Array.from(new Set([...baseColumns, ...extraDiscovered]));

  const handleToggleColumn = (colName) => {
    setExcludedList((prev) => {
      if (prev.includes(colName)) {
        return prev.filter((c) => c !== colName);
      } else {
        return [...prev, colName];
      }
    });
  };

  const handleApply = () => {
    onUpdateConfig({
      strictBaseSchema: strictMode,
      includeSourceFile,
      excludedColumns: excludedList,
    });
    onClose();
  };

  const handleResetToFirstFile = () => {
    setStrictMode(true);
    setIncludeSourceFile(false);
    setExcludedList([]);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          width: '92%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px',
          borderRadius: '16px',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
              }}
            >
              <Columns size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {language === 'si' ? 'Columns කළමනාකරණය සහ අමතර Columns වැළැක්වීම' : 'Column Alignment & Extra Columns Filter'}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {language === 'si'
                  ? 'ගොනු කිහිපයක් එකතු කිරීමේදී අනවශ්‍ය අමතර columns හැදීම වැළැක්වීම'
                  : 'Prevent extra duplicate columns from being created when combining files'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-xs"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Strict Schema Toggle Banner */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strictMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1.5px solid ${strictMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: strictMode ? '#34d399' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} />
                  <span>
                    {language === 'si'
                      ? 'පළමු ගොනුවේ (File 1) Columns වලට පමණක් සීමා කරන්න (Strict Mode)'
                      : 'Strict Base Schema (Lock to File 1 Columns Only)'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                  {language === 'si'
                    ? 'මෙය සක්‍රීය වූ විට, දෙවන හෝ තෙවන ගොනුවල ඇති වෙනස් නමකින් යුත් columns ස්වයංක්‍රීයව පළමු ගොනුවේ columns වලට ගලපන අතර, අනවශ්‍ය අමතර columns කිසිවක් හැදෙන්නේ නැත.'
                    : 'When enabled, all subsequent files align strictly to File 1 columns. No extra unmatched columns will be created.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#10b981' }}
              />
            </div>
          </div>

          {/* Source File Column Toggle */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                {language === 'si' ? 'ගොනුවේ නම සඳහන් වන column එක (_Source_File) ඇතුළත් නොකරන්න' : 'Exclude _Source_File tracking column'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {language === 'si'
                  ? 'අක්‍රිය කළ විට Master File එකෙහි _Source_File නමින් අමතර column එකක් එකතු නොවේ'
                  : 'Turn off to keep only your original Excel columns without adding _Source_File'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={!includeSourceFile}
              onChange={(e) => setIncludeSourceFile(!e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
            />
          </div>

          {/* Base Columns Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-gold)' }}>
                {language === 'si' ? 'හඳුනාගත් ප්‍රධාන Columns (Base Columns)' : 'Detected Base Columns'} ({baseColumns.length})
              </span>
              <button
                type="button"
                onClick={handleResetToFirstFile}
                className="btn btn-outline btn-xs"
                style={{ fontSize: '11px', gap: '4px' }}
              >
                <RefreshCw size={11} />
                <span>{language === 'si' ? 'පළමු File එකට Reset කරන්න' : 'Reset to File 1'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {baseColumns.map((col) => {
                const isExcluded = excludedList.includes(col);
                return (
                  <button
                    type="button"
                    key={col}
                    onClick={() => handleToggleColumn(col)}
                    className="btn btn-xs"
                    style={{
                      background: isExcluded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${isExcluded ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                      color: isExcluded ? '#f87171' : '#34d399',
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: '6px',
                      textDecoration: isExcluded ? 'line-through' : 'none',
                    }}
                    title={isExcluded ? 'Click to restore this column' : 'Click to exclude this column'}
                  >
                    {isExcluded ? '✕ ' : '✓ '}
                    {col}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra Discovered Columns (if any) */}
          {extraDiscovered.length > 0 && (
            <div style={{ marginTop: '8px', padding: '14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#f87171', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} />
                <span>
                  {language === 'si'
                    ? `අනෙක් ගොනුවල ඇති අමතර Columns (${extraDiscovered.length} Extra Columns Detected):`
                    : `Extra Columns Found in Subsequent Files (${extraDiscovered.length}):`}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {strictMode
                  ? (language === 'si'
                      ? 'Strict Mode සක්‍රීය බැවින් මෙම අමතර columns ප්‍රධාන dataset එකට එකතු නොවේ.'
                      : 'Because Strict Mode is ON, these extra columns are safely excluded.')
                  : (language === 'si'
                      ? 'Strict Mode අක්‍රිය බැවින් මේවාද dataset එකට එක් වේ. අවශ්‍ය නම් click කර ඉවත් කරන්න.'
                      : 'Click any column below to exclude it from the final merged file.')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {extraDiscovered.map((ec) => (
                  <span
                    key={ec}
                    style={{
                      fontSize: '11.5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                    }}
                  >
                    {ec} {strictMode ? '(Excluded)' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Information Note */}
          <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8', background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: '8px' }}>
            <Info size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              {language === 'si'
                ? 'සියලුම හිස් columns (__EMPTY), trailing spaces, සහ formatting phantom columns ස්වයංක්‍රීයව ඉවත් කර ඇත.'
                : 'All phantom columns (__EMPTY), trailing spaces, and blank formatted columns are automatically sanitized.'}
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            {language === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
          </button>
          <button type="button" onClick={handleApply} className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
            <Check size={15} />
            <span>{language === 'si' ? 'Columns තහවුරු කරන්න' : 'Apply Column Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
