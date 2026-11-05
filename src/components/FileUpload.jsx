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
  Columns,
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { extractFilesFromDataTransfer, filterExcelAndCsvFiles } from '../utils/folderScanner';

export default function FileUpload({
  onFilesUploaded,
  onFileUploaded,
  uploadedFilesList = [],
  onRemoveFile,
  onReset,
  selectedSheet,
  setSelectedSheet,
  parsedFileInfo,
  isLoading,
  language = 'en',
  onProceedToMapping,
  onOpenHarmonizer,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [recentNotice, setRecentNotice] = useState('');
  const [draggedFileIndex, setDraggedFileIndex] = useState(null);
  const [isOverTrashZone, setIsOverTrashZone] = useState(false);
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
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // If an existing file chip was dragged out to remove
    const isChip = e.dataTransfer && e.dataTransfer.types.includes('application/x-ird-file-chip');
    if (isChip) {
      const idxStr = e.dataTransfer.getData('text/plain');
      const idxNum = parseInt(idxStr, 10);
      if (!isNaN(idxNum) && onRemoveFile) {
        onRemoveFile(idxNum);
        setDraggedFileIndex(null);
        return;
      }
    }

    try {
      const extracted = await extractFilesFromDataTransfer(e.dataTransfer);
      if (extracted && extracted.length > 0) {
        // Incremental One-by-One Drag & Drop: When files exist, automatically append!
        const shouldAppend = uploadedFilesList && uploadedFilesList.length > 0;
        triggerFilesUpload(extracted, shouldAppend);

        const count = extracted.length;
        const msg = shouldAppend
          ? (language === 'si'
              ? `✓ +${count} ගොනු සාර්ථකව Batch එකට එකතු විය! (මුළු ගොනු: ${uploadedFilesList.length + count})`
              : language === 'ta'
              ? `✓ +${count} கோப்புகள் வெற்றிகரமாக சேர்க்கப்பட்டன!`
              : `✓ +${count} file(s) added to batch! (Total: ${uploadedFilesList.length + count})`)
          : (language === 'si'
              ? `✓ ගොනු ${count} ක් ඇතුළත් විය!`
              : language === 'ta'
              ? `✓ ${count} கோப்புகள் பதிவேற்றப்பட்டன!`
              : `✓ ${count} file(s) ingested!`);
        setRecentNotice(msg);
        setTimeout(() => setRecentNotice(''), 4500);
      } else {
        alert('No valid Excel (.xlsx, .xls) or CSV files found in the dropped item(s).');
      }
    } catch (err) {
      console.error('Folder/file drop extraction error:', err);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const shouldAppend = uploadedFilesList && uploadedFilesList.length > 0;
        triggerFilesUpload(e.dataTransfer.files, shouldAppend);
      }
    }
  };

  const handleDropzoneClick = () => {
    if (uploadedFilesList.length > 0) {
      appendFileInputRef.current && appendFileInputRef.current.click();
    } else {
      fileInputRef.current && fileInputRef.current.click();
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
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={handleDrop}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
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

      {/* 1. Main FRU Multi-File & Multi-Folder Batch Dropzone (Supports One-by-One Incremental Drag & Drop) */}
      <div
        className={`dropzone-box glass-card ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
        style={{
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          borderColor: isDragging
            ? 'var(--accent-gold)'
            : uploadedFilesList.length > 0
            ? 'rgba(16, 185, 129, 0.55)'
            : undefined,
          background: isDragging
            ? 'rgba(212, 175, 55, 0.08)'
            : uploadedFilesList.length > 0
            ? 'rgba(16, 185, 129, 0.03)'
            : undefined,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: uploadedFilesList.length > 0
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(212, 175, 55, 0.12)',
              border: uploadedFilesList.length > 0
                ? '1.5px solid rgba(16, 185, 129, 0.45)'
                : '1.5px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: uploadedFilesList.length > 0 ? '#10b981' : 'var(--accent-gold)',
            }}
          >
            {uploadedFilesList.length > 0 ? <FolderPlus size={36} /> : <UploadCloud size={36} />}
          </div>

          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              {uploadedFilesList.length > 0 ? t.dropMoreFilesHeader : t.uploadHeader}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.5 }}>
              {uploadedFilesList.length > 0
                ? t.dropMoreFilesSub.replace('{count}', uploadedFilesList.length)
                : t.uploadSubheader}
            </p>
          </div>

          {/* Real-time Incremental Drop Notification Pill */}
          {recentNotice && (
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                padding: '6px 18px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'pulse 1.5s infinite',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{recentNotice}</span>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-ird-gold btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (uploadedFilesList.length > 0) {
                  appendFileInputRef.current && appendFileInputRef.current.click();
                } else {
                  fileInputRef.current && fileInputRef.current.click();
                }
              }}
              style={{ fontWeight: 700 }}
            >
              <Files size={15} />
              <span>{uploadedFilesList.length > 0 ? t.addMoreFiles : t.uploadButtonText}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (uploadedFilesList.length > 0) {
                  appendFolderInputRef.current && appendFolderInputRef.current.click();
                } else {
                  folderInputRef.current && folderInputRef.current.click();
                }
              }}
              style={{ borderColor: 'rgba(212, 175, 55, 0.6)', color: '#fde047', fontWeight: 700 }}
              title="Select an entire folder containing Excel/CSV files"
            >
              <FolderOpen size={15} />
              <span>{uploadedFilesList.length > 0 ? t.addMoreFolders : t.uploadFolderBtn}</span>
            </button>

            {uploadedFilesList.length > 0 && onReset && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(language === 'si' ? 'සියලුම ගොනු ඉවත් කර අලුතින් ආරම්භ කිරීමට අවශ්‍යද?' : 'Are you sure you want to clear all files and start fresh?')) {
                    onReset();
                  }
                }}
                style={{ borderColor: 'rgba(239, 68, 68, 0.45)', color: '#f87171', fontWeight: 700 }}
                title="Clear all files in the batch"
              >
                <Trash2 size={14} />
                <span>{t.clearAllFiles}</span>
              </button>
            )}

            <span className="badge badge-neutral" style={{ fontSize: '11px', padding: '6px 12px' }}>
              {t.supportedFormats}
            </span>
          </div>

          {/* Folder & One-by-One Drag Explanatory Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px', justifyContent: 'center' }}>
            <div
              style={{
                fontSize: '12px',
                color: '#6ee7b7',
                background: 'rgba(16, 185, 129, 0.09)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '5px 14px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Folder size={14} color="#34d399" />
              <span>{t.folderDropHint}</span>
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#fde047',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                padding: '5px 14px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} color="#fde047" />
              <span>{t.oneByOneHint}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px', justifyContent: 'center' }}>
            <span className="badge badge-low" style={{ fontSize: '11px' }}>
              <ShieldCheck size={12} /> 100% Client-Side Secure
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              {t.batchCountLabel}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              Multi-Folder & Subfolder Scanner
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

              {onOpenHarmonizer && (
                <button
                  type="button"
                  onClick={onOpenHarmonizer}
                  className="btn btn-outline btn-sm"
                  style={{
                    borderColor: 'rgba(59, 130, 246, 0.55)',
                    color: '#93c5fd',
                    fontWeight: 700,
                    background: 'rgba(59, 130, 246, 0.08)',
                  }}
                  title="Manage and align columns to prevent extra duplicate columns"
                >
                  <Columns size={14} />
                  <span>{language === 'si' ? 'Columns කළමනාකරණය' : 'Manage Columns'}</span>
                </button>
              )}

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
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(fIdx));
                      e.dataTransfer.setData('application/x-ird-file-chip', 'true');
                      setDraggedFileIndex(fIdx);
                    }}
                    onDragEnd={() => {
                      setDraggedFileIndex(null);
                      setIsOverTrashZone(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'grab',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                    }}
                    title="Drag out to remove or click trash button (ඉවත් කිරීමට අදින්න හෝ බටනය ඔබන්න)"
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

                    {onRemoveFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFile(fIdx);
                        }}
                        className="btn btn-outline btn-xs"
                        style={{ padding: '3px 7px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}
                        title="Remove this file from batch (මෙම ගොනුව ඉවත් කරන්න)"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dedicated Drag-Out Trash Drop Target */}
              {draggedFileIndex !== null && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOverTrashZone(true);
                  }}
                  onDragLeave={() => setIsOverTrashZone(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedFileIndex !== null && onRemoveFile) {
                      onRemoveFile(draggedFileIndex);
                      setDraggedFileIndex(null);
                      setIsOverTrashZone(false);
                    }
                  }}
                  style={{
                    marginTop: '14px',
                    padding: '14px 20px',
                    border: '2px dashed #ef4444',
                    borderRadius: '10px',
                    background: isOverTrashZone ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.1)',
                    textAlign: 'center',
                    color: '#f87171',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Trash2 size={18} />
                  <span>
                    {language === 'si'
                      ? 'මෙම ගොනුව ඉවත් කිරීමට (Remove) මෙතැනට Drop කරන්න'
                      : language === 'ta'
                      ? 'இந்தக் கோப்பை அகற்ற இங்கே Drop செய்யவும்'
                      : 'Drop here to remove file from batch'}
                  </span>
                </div>
              )}
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
