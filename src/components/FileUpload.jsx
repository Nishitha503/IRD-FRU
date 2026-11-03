import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Building,
  ArrowRight,
  FileCheck,
  Plus,
  Trash2,
  Files,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { extractFilesFromDataTransfer, filterExcelAndCsvFiles } from '../utils/folderScanner';

export default function FileUpload({
  onFilesUploaded,
  onFileUploaded,
  uploadedFilesList = [],
  onRemoveFile,
  selectedSheet,
  setSelectedSheet,
  parsedFileInfo,
  isLoading,
  language = 'en',
  onProceedToMapping,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const appendFileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const appendFolderInputRef = useRef(null);
  const t = getTranslation(language);

  // Normalized handler that supports both onFilesUploaded and onFileUploaded
  const triggerFilesUpload = (files, append = false) => {
    if (onFilesUploaded) {
      onFilesUploaded(files, append);
    } else if (onFileUploaded) {
      onFileUploaded(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    try {
      const extracted = await extractFilesFromDataTransfer(e.dataTransfer);
      if (extracted && extracted.length > 0) {
        triggerFilesUpload(extracted, false);
      } else {
        alert('No valid Excel (.xlsx, .xls) or CSV files found in the dropped folder(s)/files.');
      }
    } catch (err) {
      console.error('Folder/file drop extraction error:', err);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        triggerFilesUpload(e.dataTransfer.files, false);
      }
    }
  };

  const handleFileChange = (e, append = false) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerFilesUpload(e.target.files, append);
      e.target.value = '';
    }
  };

  const handleFolderChange = (e, append = false) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = filterExcelAndCsvFiles(e.target.files);
      if (validFiles.length > 0) {
        triggerFilesUpload(validFiles, append);
      } else {
        alert('The selected folder does not contain any valid Excel (.xlsx, .xls) or CSV files.');
      }
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hidden File Inputs for Standard Multiple Files Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, false)}
        accept=".xlsx, .xls, .csv"
        multiple
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={appendFileInputRef}
        onChange={(e) => handleFileChange(e, true)}
        accept=".xlsx, .xls, .csv"
        multiple
        style={{ display: 'none' }}
      />

      {/* Hidden File Inputs for Folder / Directory Selection (webkitdirectory) */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={(e) => handleFolderChange(e, false)}
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={appendFolderInputRef}
        onChange={(e) => handleFolderChange(e, true)}
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
      />

      {/* 1. Main FRU Multi-File & Multi-Folder Batch Dropzone */}
      <div
        className={`dropzone-box glass-card ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1.5px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
            }}
          >
            <UploadCloud size={36} />
          </div>

          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              {t.uploadHeader}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto' }}>
              {t.uploadSubheader}
            </p>
          </div>

          {/* Action Trigger Buttons: Browse Files OR Select Folder(s) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-ird-gold btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current && fileInputRef.current.click();
              }}
              style={{ fontWeight: 700 }}
            >
              <Files size={15} />
              <span>{t.uploadButtonText}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current && folderInputRef.current.click();
              }}
              style={{ borderColor: 'rgba(212, 175, 55, 0.6)', color: '#fde047', fontWeight: 700 }}
              title="Select an entire folder containing Excel/CSV files"
            >
              <FolderOpen size={15} />
              <span>{t.uploadFolderBtn}</span>
            </button>

            <span className="badge badge-neutral" style={{ fontSize: '11px', padding: '6px 12px' }}>
              {t.supportedFormats}
            </span>
          </div>

          {/* Folder Drag & Drop Explanatory Badge */}
          <div
            style={{
              fontSize: '12px',
              color: '#6ee7b7',
              background: 'rgba(16, 185, 129, 0.09)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 14px',
              borderRadius: '20px',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Folder size={14} color="#34d399" />
            <span>{t.folderDropHint}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px', justifyContent: 'center' }}>
            <span className="badge badge-low" style={{ fontSize: '11px' }}>
              <ShieldCheck size={12} /> 100% Client-Side Secure
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              Multi-Folder & Subfolder Scanner
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              Multi-File Batch Aggregator
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              Section 102 Compliant
            </span>
          </div>
        </div>
      </div>

      {/* 2. Files Loaded / Batch Manager Panel */}
      {parsedFileInfo && (
        <div className="glass-card" style={{ padding: '22px 26px', border: '1.5px solid rgba(212, 175, 55, 0.45)' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                  {parsedFileInfo.isMultiFile ? 'Multi-File Batch Ingested' : t.fileSelected}
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0' }}>
                  {parsedFileInfo.fileName}
                </h4>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#fde047', fontWeight: 700 }}>
                    {parsedFileInfo.sheetsData[selectedSheet]?.rowCount?.toLocaleString() || 0}
                  </span>{' '}
                  {t.totalRows} •{' '}
                  <span>
                    {parsedFileInfo.sheetsData[selectedSheet]?.headers?.length || 0} {t.columnsFound}
                  </span>
                  {parsedFileInfo.isMultiFile && (
                    <span style={{ marginLeft: '10px', color: '#10b981', fontSize: '11.5px' }}>
                      (Includes auto-tagged <code>_Source_File</code> column)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => appendFileInputRef.current && appendFileInputRef.current.click()}
                className="btn btn-outline btn-sm"
                style={{ borderColor: 'rgba(212, 175, 55, 0.5)', color: '#fde047', fontWeight: 700 }}
                title="Add more Excel files to this batch"
              >
                <Plus size={14} />
                <span>{t.addMoreFiles}</span>
              </button>

              <button
                type="button"
                onClick={() => appendFolderInputRef.current && appendFolderInputRef.current.click()}
                className="btn btn-outline btn-sm"
                style={{ borderColor: 'rgba(59, 130, 246, 0.5)', color: '#93c5fd', fontWeight: 700 }}
                title="Add another folder containing Excel files to this batch"
              >
                <FolderPlus size={14} />
                <span>{t.addMoreFolders}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="btn btn-outline btn-sm"
              >
                {t.chooseAnotherFile}
              </button>

              {onProceedToMapping && (
                <button
                  type="button"
                  onClick={onProceedToMapping}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 800, padding: '7px 18px' }}
                >
                  <span>{t.proceedToMapping}</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* List of Individual Ingested Files (When multiple files are uploaded) */}
          {parsedFileInfo.filesSummary && parsedFileInfo.filesSummary.length > 0 && (
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ingested Source Files ({parsedFileInfo.filesSummary.length})
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {t.mergedNotice}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {parsedFileInfo.filesSummary.map((fileItem, fIdx) => (
                  <div
                    key={`${fileItem.name}_${fIdx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {fileItem.folderPath ? (
                        <Folder size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
                      ) : (
                        <FileSpreadsheet size={16} color="#fde047" style={{ flexShrink: 0 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={fileItem.name}
                        >
                          {fileItem.folderPath && fileItem.folderPath.includes('/') && (
                            <span
                              style={{
                                fontSize: '10px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#93c5fd',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                marginRight: '5px',
                              }}
                            >
                              📁 {fileItem.folderPath.split('/')[0]}
                            </span>
                          )}
                          <span>{fileItem.baseName || fileItem.name}</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          {fileItem.totalRows?.toLocaleString() || 0} rows • {formatFileSize(fileItem.size)}
                        </div>
                      </div>
                    </div>

                    {onRemoveFile && parsedFileInfo.filesSummary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveFile(fIdx)}
                        className="btn btn-outline btn-xs"
                        style={{ padding: '3px 6px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="Remove this file from batch"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Sheet / Multi-File Selector */}
          {parsedFileInfo.sheetNames && parsedFileInfo.sheetNames.length > 1 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '12px', fontWeight: 700 }}>
                <Layers size={14} color="var(--accent-gold)" />
                <span>Dataset / Sheet to Analyze:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {parsedFileInfo.sheetNames.map((name) => {
                  const count = parsedFileInfo.sheetsData[name]?.rowCount || 0;
                  const isSel = selectedSheet === name;
                  const isMerged = parsedFileInfo.sheetsData[name]?.isMerged;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedSheet(name)}
                      className={`btn btn-sm ${isSel ? 'btn-primary' : 'btn-outline'}`}
                      style={{
                        padding: '6px 14px',
                        fontWeight: isSel || isMerged ? 800 : 600,
                        borderColor: isMerged ? '#d4af37' : undefined,
                      }}
                    >
                      {isMerged ? <Files size={13} /> : <FileSpreadsheet size={13} />}
                      <span>{name}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px', marginLeft: '6px' }}>
                        {count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Official Forced Registration Unit Guidelines */}
      <div className="glass-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Building size={20} color="var(--accent-gold)" />
          <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t.fruDirectivesTitle}
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>•</span>
            <span>{t.fruGuideline1}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>•</span>
            <span>{t.fruGuideline2}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
            <span>{t.fruGuideline3}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
