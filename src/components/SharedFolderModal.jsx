import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Database,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Share2,
  ShieldCheck,
  Server,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import {
  getSharedFolderConfig,
  saveSharedFolderConfig,
  linkDirectoryPicker,
  archiveRecordsToSharedFolder,
  loadTransactionsFromIndexedDB,
} from '../services/sharedFolderService';
import { getTranslation } from '../utils/translations';

export default function SharedFolderModal({
  isOpen,
  onClose,
  records = [],
  activeOfficer,
  language = 'en',
  onHistoryUpdated,
}) {
  if (!isOpen) return null;

  const t = getTranslation(language);
  const [config, setConfig] = useState(() => getSharedFolderConfig());
  const [customPath, setCustomPath] = useState(config.folderPath || '');
  const [isLinking, setIsLinking] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [historicalCount, setHistoricalCount] = useState(config.totalTransactions || 0);

  useEffect(() => {
    // Check local database count
    loadTransactionsFromIndexedDB().then((list) => {
      setHistoricalCount(list.length);
    });

    // Check server.ps1 shared-folder status if available
    fetch('/api/shared-folder/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.folderPath) {
          setConfig((prev) => ({
            ...prev,
            isLinked: true,
            folderPath: data.folderPath,
            folderName: data.folderPath.split('\\').pop() || 'IRD_SHARED_REPOSITORY',
            totalTransactions: data.totalTransactions || prev.totalTransactions,
          }));
          setCustomPath(data.folderPath);
          if (data.totalTransactions) setHistoricalCount(data.totalTransactions);
        }
      })
      .catch(() => {});
  }, []);

  // Handle linking folder via File System Access API
  const handlePickFolder = async () => {
    setIsLinking(true);
    setNotice('');
    setErrorNotice('');
    try {
      const result = await linkDirectoryPicker();
      if (result.success) {
        setConfig(result.config);
        setCustomPath(result.folderName);
        setNotice(`Shared Folder "${result.folderName}" සාර්ථකව සම්බන්ධ විය (Linked).`);
        if (onHistoryUpdated) onHistoryUpdated();
      } else if (result.error && !result.error.includes('cancelled')) {
        setErrorNotice(result.error);
      }
    } catch (err) {
      setErrorNotice(err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Handle saving custom network path (e.g. \\SERVER\Share or Z:\FRU_Data)
  const handleSaveCustomPath = async () => {
    if (!customPath.trim()) return;
    setNotice('');
    setErrorNotice('');

    try {
      const res = await fetch('/api/shared-folder/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: customPath.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = saveSharedFolderConfig({
          isLinked: true,
          folderPath: data.folderPath,
          folderName: data.folderPath.split('\\').pop() || data.folderPath,
          lastSyncAt: new Date().toISOString(),
        });
        setConfig(updated);
        setNotice(`Network Shared Folder path saved: ${data.folderPath}`);
      }
    } catch (err) {
      // Offline fallback
      const updated = saveSharedFolderConfig({
        isLinked: true,
        folderPath: customPath.trim(),
        folderName: customPath.trim().split('\\').pop() || customPath.trim(),
        lastSyncAt: new Date().toISOString(),
      });
      setConfig(updated);
      setNotice(`Shared Folder path configured locally: ${customPath.trim()}`);
    }
  };

  // Archive current session records into shared folder
  const handleArchiveCurrentSession = async () => {
    if (!records || records.length === 0) {
      setErrorNotice('No active session records available to archive.');
      return;
    }
    setIsArchiving(true);
    setNotice('');
    setErrorNotice('');
    try {
      const res = await archiveRecordsToSharedFolder(records, activeOfficer);
      if (res.success) {
        setNotice(`සාර්ථකයි! ගනුදෙනු ${res.addedCount.toLocaleString()} ක් Shared Folder එකෙහි මාස 6 ක ඉතිහාසයට තැන්පත් කරන ලදී. (මුළු ඉතිහාසය: ${res.totalHistoricalCount})`);
        setHistoricalCount(res.totalHistoricalCount);
        if (onHistoryUpdated) onHistoryUpdated();
      } else {
        setErrorNotice(res.error || 'Failed to archive records.');
      }
    } catch (err) {
      setErrorNotice('Error archiving records: ' + err.message);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="glass-card modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.25)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fde047',
              }}
            >
              <Share2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Shared Folder & 6-Month Historical Repository
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                LAN Network Share • Multi-Officer Sync • 6-Month Cumulative Taxpayer Ledger
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          {/* Notifications */}
          {notice && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#6ee7b7', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{notice}</span>
            </div>
          )}

          {errorNotice && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Connection Status Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: config.isLinked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.08)',
              border: `1px solid ${config.isLinked ? 'rgba(16, 185, 129, 0.35)' : 'rgba(212, 175, 55, 0.3)'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={18} color={config.isLinked ? '#34d399' : '#fde047'} />
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Repository Connection Status</span>
              </div>
              <span
                className={`badge ${config.isLinked ? 'badge-low' : 'badge-neutral'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {config.isLinked ? '🟢 Connected / Linked' : '⚪ Standalone Local'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Historical Transactions</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#fde047', marginTop: '2px' }}>
                  {historicalCount.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Investigation Scope</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                  Past 6 Months
                </div>
              </div>

              <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Last Synchronized</div>
                <div style={{ fontSize: '11px', color: '#ffffff', marginTop: '4px' }}>
                  {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleTimeString() : 'Pending Sync'}
                </div>
              </div>
            </div>
          </div>

          {/* Folder Path Configuration */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={16} color="var(--accent-gold)" />
              Link Shared Folder / Network Path (UNC / LAN)
            </h4>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Select a shared network drive (e.g. <code>Z:\FRU_Shared_Data</code>) or UNC path (<code>\\SERVER\IRD_Share</code>). 
              All officers linking to this folder can search and audit the same cumulative 6-month transaction database.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePickFolder}
                disabled={isLinking}
                className="btn btn-ird-gold btn-sm"
                style={{ gap: '6px', fontWeight: 700 }}
              >
                <FolderOpen size={14} />
                <span>{isLinking ? 'Opening Folder Dialog...' : 'Browse & Link Shared Folder'}</span>
              </button>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g., \\SERVER\IRD_Share or C:\Users\Intel\Desktop\IRD_SHARED_REPOSITORY"
                className="form-control form-control-sm"
                style={{ fontSize: '12px', flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSaveCustomPath}
                className="btn btn-outline btn-sm"
              >
                Set Path
              </button>
            </div>
          </div>

          {/* Active Dataset Archival Action */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UploadCloud size={16} color="#34d399" />
                  Archive Active Session to Shared Repository
                </h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Saves currently loaded <strong>{records.length} taxpayer records</strong> into the 6-month shared history.
                </p>
              </div>

              <button
                type="button"
                onClick={handleArchiveCurrentSession}
                disabled={isArchiving || records.length === 0}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', fontWeight: 700 }}
              >
                <Database size={14} />
                <span>{isArchiving ? 'Archiving...' : 'Archive to Shared Folder'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.25)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            100% Secure Local/LAN Storage • Section 102 Inland Revenue Act
          </span>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

