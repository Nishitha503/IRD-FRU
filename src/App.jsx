import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MasterDataGrid from './components/MasterDataGrid';
import TaxpayerDetailModal from './components/TaxpayerDetailModal';
import NoticeGeneratorModal from './components/NoticeGeneratorModal';
import RuleConfigModal from './components/RuleConfigModal';
import UserProfileModal from './components/UserProfileModal';
import AuthGateway from './components/AuthGateway';
import WelcomeGateway from './components/WelcomeGateway';
import ExportPanel from './components/ExportPanel';
import TinHistoryModal from './components/TinHistoryModal';
import SharedFolderModal from './components/SharedFolderModal';

import { parseExcelFile, parseMultipleExcelFiles, autoDetectColumnMapping } from './utils/excelProcessor';
import { analyzeRawData, DEFAULT_RULES } from './utils/ruleEngine';
import { SAMPLE_DATASETS } from './utils/sampleData';
import {
  loadOfficerProfiles,
  saveOfficerProfiles,
  getActiveOfficerProfile,
  setActiveOfficerProfileId,
  isUserAuthenticated,
  setAuthenticationSession,
} from './utils/userManagement';
import { fetchCloudOfficerProfiles } from './services/authDatabaseService';
import { archiveRecordsToSharedFolder } from './services/sharedFolderService';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isUserAuthenticated());
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('ird_language') || 'si');

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('ird_language', newLang);
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepAllowed, setMaxStepAllowed] = useState(1);

  // Officer / User Profiles State
  const [officerProfiles, setOfficerProfiles] = useState(() => loadOfficerProfiles());
  const [activeOfficer, setActiveOfficer] = useState(() => getActiveOfficerProfile(loadOfficerProfiles()));
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // File and Sheet State (Supports Multi-File Batch Ingestion)
  const [uploadedFilesList, setUploadedFilesList] = useState([]);
  const [parsedFileInfo, setParsedFileInfo] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    nic: '',
    brn: '',
    tin: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    turnover: '',
    agency: '',
    txDate: '',
    category: '',
    description: '',
  });

  // Business Rules & Analysis State
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [masterRecords, setMasterRecords] = useState([]);
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState(null);
  const [selectedRecordForNotice, setSelectedRecordForNotice] = useState(null);
  const [isTinHistoryOpen, setIsTinHistoryOpen] = useState(false);
  const [selectedTinForHistory, setSelectedTinForHistory] = useState('');
  const [isSharedFolderModalOpen, setIsSharedFolderModalOpen] = useState(false);

  const handleOpenTinHistory = (tinToSearch = '') => {
    setSelectedTinForHistory(typeof tinToSearch === 'string' ? tinToSearch : '');
    setIsTinHistoryOpen(true);
  };

  // Apply dark mode theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Sync latest officer profiles from Cloud Database (if configured)
  useEffect(() => {
    fetchCloudOfficerProfiles().then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setOfficerProfiles(cloudList);
        saveOfficerProfiles(cloudList);
      }
    });
  }, []);

  // When selectedSheet changes, update rawRows and auto-detect columns
  useEffect(() => {
    if (parsedFileInfo && selectedSheet && parsedFileInfo.sheetsData[selectedSheet]) {
      const sheetData = parsedFileInfo.sheetsData[selectedSheet];
      setRawRows(sheetData.rows);
      setAvailableHeaders(sheetData.headers);
      const autoMap = autoDetectColumnMapping(sheetData.headers);
      setColumnMapping(autoMap);
    }
  }, [parsedFileInfo, selectedSheet]);

  // Handle successful login
  const handleSuccessfulLogin = (officer) => {
    setActiveOfficer(officer);
    setActiveOfficerProfileId(officer.id);
    setIsAuthenticated(true);
    setAuthenticationSession(true);
  };

  // Handle registering a new officer from AuthGateway
  const handleRegisterOfficer = (newOfficer) => {
    const updated = [...officerProfiles, newOfficer];
    setOfficerProfiles(updated);
    saveOfficerProfiles(updated);
    handleSuccessfulLogin(newOfficer);
  };

  // Handle logout / lock
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticationSession(false);
    setShowWelcome(true);
  };

  // Handle switching active officer
  const handleSelectOfficerProfile = (profile) => {
    setActiveOfficer(profile);
    setActiveOfficerProfileId(profile.id);
  };

  // Handle saving modified officer list from modal
  const handleSaveOfficerProfiles = (profiles) => {
    setOfficerProfiles(profiles);
    saveOfficerProfiles(profiles);
  };

  // Handle uploaded local file(s) - Supports Multi-file Batch Ingestion
  const handleFilesUpload = async (newFiles, append = false) => {
    setIsLoading(true);
    try {
      const filesArray = Array.from(newFiles || []);
      if (filesArray.length === 0) return;

      const combined = append ? [...uploadedFilesList, ...filesArray] : filesArray;
      // Deduplicate files by name & size
      const uniqueFiles = [];
      const seen = new Set();
      for (const f of combined) {
        const pathIdent = f._folderPath || f.webkitRelativePath || f.name;
        const key = `${pathIdent}_${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueFiles.push(f);
        }
      }

      setUploadedFilesList(uniqueFiles);
      const parsed = await parseMultipleExcelFiles(uniqueFiles);
      setParsedFileInfo(parsed);
      const firstSheet = parsed.sheetNames[0];
      setSelectedSheet(firstSheet);
      setMaxStepAllowed((prev) => Math.max(prev, 2));
    } catch (err) {
      alert('Error reading Excel file(s): ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a file from the uploaded multi-file batch
  const handleRemoveUploadedFile = async (fileIndex) => {
    const updated = uploadedFilesList.filter((_, idx) => idx !== fileIndex);
    if (updated.length === 0) {
      handleReset();
      return;
    }
    setUploadedFilesList(updated);
    setIsLoading(true);
    try {
      const parsed = await parseMultipleExcelFiles(updated);
      setParsedFileInfo(parsed);
      setSelectedSheet(parsed.sheetNames[0]);
    } catch (err) {
      alert('Error updating file list: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Loading Sample Datasets
  const handleLoadSample = (sampleKey) => {
    const sample = SAMPLE_DATASETS[sampleKey];
    if (!sample) return;

    const headers = Object.keys(sample.rows[0]);
    const mockParsed = {
      fileName: `${sample.name}.xlsx`,
      sheetNames: ['Sheet1'],
      sheetsData: {
        'Sheet1': {
          headers,
          rows: sample.rows,
          rowCount: sample.rows.length,
        },
      },
    };

    setParsedFileInfo(mockParsed);
    setSelectedSheet('Sheet1');
    setRawRows(sample.rows);
    setAvailableHeaders(headers);

    const autoMap = autoDetectColumnMapping(headers);
    setColumnMapping(autoMap);

    setCurrentStep(2);
    setMaxStepAllowed(2);
  };

  // Run Intelligence & Analysis
  const handleRunAnalysis = () => {
    if (!rawRows || rawRows.length === 0) {
      alert('No rows found in the selected sheet.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const { records, summary } = analyzeRawData(rawRows, columnMapping, rules, availableHeaders);
        setMasterRecords(records);
        setAnalysisSummary(summary);
        // Automatically archive and persist to Shared Folder & IndexedDB history store
        archiveRecordsToSharedFolder(records, activeOfficer).catch((archiveErr) => {
          console.warn('Auto shared folder archive notice:', archiveErr);
        });
        setCurrentStep(3);
        setMaxStepAllowed(4);
      } catch (err) {
        alert('Analysis Error: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  // Re-run analysis when rules are saved
  const handleSaveRules = (newRules) => {
    setRules(newRules);
    if (rawRows.length > 0 && currentStep >= 3) {
      const { records, summary } = analyzeRawData(rawRows, columnMapping, newRules, availableHeaders);
      setMasterRecords(records);
      setAnalysisSummary(summary);
    }
  };

  // Update a single record after officer review
  const handleSaveRecordEdits = (updatedRecord) => {
    setMasterRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  };

  // Handle bulk action
  const handleBulkAction = (actionType, ids) => {
    const idSet = new Set(ids);
    setMasterRecords((prev) =>
      prev.map((r) => {
        if (idSet.has(r.id)) {
          return {
            ...r,
            reviewStatus: actionType,
            lastReviewedBy: activeOfficer ? `${activeOfficer.name} (${activeOfficer.designation})` : r.lastReviewedBy,
            lastReviewedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
    alert(`Updated ${ids.length} records to status: ${actionType} by officer ${activeOfficer?.name}`);
  };

  // Reset all and start fresh
  const handleReset = () => {
    setUploadedFilesList([]);
    setParsedFileInfo(null);
    setSelectedSheet('');
    setRawRows([]);
    setAvailableHeaders([]);
    setMasterRecords([]);
    setAnalysisSummary(null);
    setCurrentStep(1);
    setMaxStepAllowed(1);
  };

  // If not authenticated, render Welcome Intro UI first, then Officer Login
  if (!isAuthenticated) {
    if (showWelcome) {
      return (
        <WelcomeGateway
          onProceed={() => setShowWelcome(false)}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      );
    }

    return (
      <AuthGateway
        profiles={officerProfiles}
        onSuccessfulLogin={handleSuccessfulLogin}
        onRegisterOfficer={handleRegisterOfficer}
        language={language}
        onLanguageChange={handleLanguageChange}
        onBack={() => setShowWelcome(true)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onOpenTinHistory={() => handleOpenTinHistory()}
        onOpenSharedFolder={() => setIsSharedFolderModalOpen(true)}
        hasData={masterRecords.length > 0}
        recordCount={masterRecords.length}
        activeOfficer={activeOfficer}
        onOpenUserProfiles={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Container */}
      <main className="container" style={{ flex: 1, paddingBottom: '60px' }}>
        {/* Step Navigation Bar */}
        <StepIndicator
          currentStep={currentStep}
          setStep={setCurrentStep}
          maxStepAllowed={maxStepAllowed}
          language={language}
        />

        {/* Step 1: File Upload (Multi-File Batch Supported) */}
        {currentStep === 1 && (
          <FileUpload
            onFilesUploaded={handleFilesUpload}
            onFileUploaded={handleFilesUpload}
            uploadedFilesList={uploadedFilesList}
            onRemoveFile={handleRemoveUploadedFile}
            selectedSheet={selectedSheet}
            setSelectedSheet={setSelectedSheet}
            parsedFileInfo={parsedFileInfo}
            isLoading={isLoading}
            language={language}
            onProceedToMapping={() => {
              setCurrentStep(2);
              setMaxStepAllowed((prev) => Math.max(prev, 2));
            }}
          />
        )}

        {/* Step 2: Column Mapping */}
        {currentStep === 2 && (
          <ColumnMapper
            availableHeaders={availableHeaders}
            columnMapping={columnMapping}
            setColumnMapping={setColumnMapping}
            sampleRows={rawRows}
            onRunAnalysis={handleRunAnalysis}
            onBack={() => setCurrentStep(1)}
            fileName={parsedFileInfo?.fileName || 'Uploaded File'}
          />
        )}

        {/* Step 3: Intelligence & Master Grid */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Analytics Summary */}
            <AnalyticsDashboard
              summary={analysisSummary}
              onFilterRisk={(risk) => {}}
              onFilterAction={(act) => {}}
            />

            {/* Action Bar */}
            <div
              className="glass-card"
              style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                  Consolidated Taxpayer Master Register
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Aggregated, cleaned and risk-scored records under Section 102 of the Inland Revenue Act No. 24 of 2017
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-outline btn-sm"
                >
                  Edit Column Mapping
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn btn-primary btn-sm"
                >
                  Proceed to Export & Notices →
                </button>
              </div>
            </div>

            {/* Master Data Grid */}
            <MasterDataGrid
              records={masterRecords}
              onSelectRecord={(rec) => setSelectedRecordForDetail(rec)}
              onGenerateNotice={(rec) => setSelectedRecordForNotice(rec)}
              onUpdateRecordStatus={handleSaveRecordEdits}
              onBulkAction={handleBulkAction}
              onOpenTinHistory={handleOpenTinHistory}
            />
          </div>
        )}

        {/* Step 4: Export Panel */}
        {currentStep === 4 && (
          <ExportPanel
            records={masterRecords}
            summary={analysisSummary}
            onReset={handleReset}
            fileName={parsedFileInfo?.fileName}
            originalHeaders={availableHeaders}
            rawRows={rawRows}
          />
        )}
      </main>

      {/* Modals */}
      <TaxpayerDetailModal
        record={selectedRecordForDetail}
        isOpen={Boolean(selectedRecordForDetail)}
        onClose={() => setSelectedRecordForDetail(null)}
        onGenerateNotice={(rec) => {
          setSelectedRecordForDetail(null);
          setSelectedRecordForNotice(rec);
        }}
        onSaveRecordEdits={handleSaveRecordEdits}
        activeOfficer={activeOfficer}
        onOpenTinHistory={handleOpenTinHistory}
      />

      <TinHistoryModal
        isOpen={isTinHistoryOpen}
        onClose={() => setIsTinHistoryOpen(false)}
        records={masterRecords}
        initialTin={selectedTinForHistory}
        activeOfficer={activeOfficer}
        language={language}
      />

      <SharedFolderModal
        isOpen={isSharedFolderModalOpen}
        onClose={() => setIsSharedFolderModalOpen(false)}
        records={masterRecords}
        activeOfficer={activeOfficer}
        language={language}
      />

      <NoticeGeneratorModal
        record={selectedRecordForNotice}
        isOpen={Boolean(selectedRecordForNotice)}
        onClose={() => setSelectedRecordForNotice(null)}
        activeOfficer={activeOfficer}
      />

      <RuleConfigModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onSaveRules={handleSaveRules}
      />

      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        profiles={officerProfiles}
        activeProfile={activeOfficer}
        onSelectProfile={handleSelectOfficerProfile}
        onSaveProfiles={handleSaveOfficerProfiles}
      />

      {/* Official Government Footer Matching ird.gov.lk */}
      <footer className="gov-official-footer">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="gov-footer-links-row">
            <a
              href="https://www.ird.gov.lk/en/sitepages/default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-footer-link"
            >
              🏛️ Official IRD Web Portal (ird.gov.lk)
            </a>
            <span className="gov-footer-sep">•</span>
            <a
              href="https://www.treasury.gov.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-footer-link"
            >
              🇱🇰 Ministry of Finance, Economic Stabilization and National Policies
            </a>
            <span className="gov-footer-sep">•</span>
            <a
              href="tel:1944"
              className="gov-footer-link highlight"
            >
              📞 IRD Call Centre Hotline: 1944
            </a>
          </div>

          <div style={{ textAlign: 'center', lineHeight: 1.6 }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
              Department of Inland Revenue • Sri Lanka (දේශීය ආදායම් දෙපාර්තමේන්තුව)
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Forced Registration Unit (FRU) • Sir Chittampalam A. Gardiner Mawatha, Colombo 02, Sri Lanka.
            </p>
            <p style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Statutory Operations under Inland Revenue Act No. 24 of 2017 & Value Added Tax Act No. 14 of 2002.
            </p>
          </div>

          <div className="novix-footer-brand">
            <span className="novix-dot"></span>
            <span>Powered by <strong>Novix Solutions</strong> • Enterprise Tax Intelligence Division</span>
          </div>
        </div>
      </footer>

      {/* Floating Developer Watermark Badge */}
      <div
        className="novix-floating-badge"
        title="Software Architecture & Engineering by Novix Solutions"
      >
        <span className="novix-dot"></span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.4px' }}>
          Powered by <span style={{ color: '#60a5fa' }}>Novix Solutions</span>
        </span>
      </div>
    </div>
  );
}
