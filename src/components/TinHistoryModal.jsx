import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  DollarSign,
  Building,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  X,
  ArrowRight,
  ShieldAlert,
  Coins,
  History,
  Tag,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTranslation } from '../utils/translations';
import { IRDCrest } from './OfficialEmblem';

/**
 * Normalizes various date representations (ISO, DD/MM/YYYY, Excel serial, etc.) into a JavaScript Date object
 */
function parseFlexibleDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) return dateVal;

  // Excel serial date number
  if (typeof dateVal === 'number' && dateVal > 25569) {
    const epochMillis = (dateVal - 25569) * 86400 * 1000;
    const d = new Date(epochMillis);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(dateVal).trim();
  if (!str) return null;

  // Try standard Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const customDate = new Date(year, month, day);
    if (!isNaN(customDate.getTime())) return customDate;
  }

  return null;
}

export default function TinHistoryModal({
  isOpen,
  onClose,
  records = [],
  initialTin = '',
  activeOfficer,
  language = 'en',
}) {
  if (!isOpen) return null;

  const t = getTranslation(language);
  const [inputTin, setInputTin] = useState(initialTin || '');
  const [selectedRange, setSelectedRange] = useState('6M'); // '1M' | '3M' | '6M' | 'ALL'

  // Extract all unique TINs present in currently loaded master records for autocomplete
  const availableTins = useMemo(() => {
    const tinMap = new Map();
    records.forEach((r) => {
      if (r.tin && r.tin.trim()) {
        tinMap.set(r.tin.trim(), `${r.tin.trim()} - ${r.name}`);
      }
    });
    return Array.from(tinMap.entries()).map(([tin, label]) => ({ tin, label }));
  }, [records]);

  // Find matching taxpayer entity
  const matchedRecord = useMemo(() => {
    if (!inputTin.trim()) return null;
    const clean = inputTin.trim().toLowerCase();
    return (
      records.find(
        (r) =>
          (r.tin && r.tin.toLowerCase() === clean) ||
          r.nic.toLowerCase() === clean ||
          r.id.toLowerCase() === clean ||
          (r.brn && r.brn.toLowerCase() === clean)
      ) || null
    );
  }, [records, inputTin]);

  // Compute reference benchmark date (latest transaction date or today)
  const referenceDate = useMemo(() => {
    if (!matchedRecord || !matchedRecord.transactions || matchedRecord.transactions.length === 0) {
      return new Date();
    }
    let latest = null;
    matchedRecord.transactions.forEach((tx) => {
      const d = parseFlexibleDate(tx.date);
      if (d && (!latest || d > latest)) latest = d;
    });
    return latest || new Date();
  }, [matchedRecord]);

  // Date range cutoff calculation
  const cutoffDate = useMemo(() => {
    if (selectedRange === 'ALL') return null;
    const target = new Date(referenceDate.getTime());
    if (selectedRange === '1M') target.setMonth(target.getMonth() - 1);
    else if (selectedRange === '3M') target.setMonth(target.getMonth() - 3);
    else if (selectedRange === '6M') target.setMonth(target.getMonth() - 6);
    return target;
  }, [selectedRange, referenceDate]);

  // Filter transactions according to selected range (Default: past 6 months)
  const filteredTransactions = useMemo(() => {
    if (!matchedRecord || !matchedRecord.transactions) return [];
    if (!cutoffDate) return matchedRecord.transactions;

    return matchedRecord.transactions.filter((tx) => {
      const txDate = parseFlexibleDate(tx.date);
      if (!txDate) return true; // Keep if date is unspecified so data is not lost
      return txDate >= cutoffDate && txDate <= referenceDate;
    });
  }, [matchedRecord, cutoffDate, referenceDate]);

  // Aggregated 6-month metrics
  const aggregatedStats = useMemo(() => {
    if (!filteredTransactions.length) {
      return {
        totalTurnover: 0,
        txCount: 0,
        estVat: 0,
        estSscl: 0,
        agencies: [],
        monthlyBuckets: [],
      };
    }

    let total = 0;
    const agencySet = new Set();
    const monthMap = new Map();

    filteredTransactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      total += amount;
      if (tx.agency) agencySet.add(tx.agency);

      const d = parseFlexibleDate(tx.date) || new Date();
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { key: monthKey, label: monthLabel, amount: 0, count: 0 });
      }
      const b = monthMap.get(monthKey);
      b.amount += amount;
      b.count += 1;
    });

    const monthlyBuckets = Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    const estVat = total >= 60000000 ? total * 0.18 : 0;
    const estSscl = total >= 120000000 ? total * 0.025 : 0;

    return {
      totalTurnover: total,
      txCount: filteredTransactions.length,
      estVat,
      estSscl,
      agencies: Array.from(agencySet),
      monthlyBuckets,
    };
  }, [filteredTransactions]);

  // Export 6-Month Historical Audit Report as PDF
  const handleExportPDF = () => {
    if (!matchedRecord) return;
    const doc = new jsPDF();
    const tinLabel = matchedRecord.tin || inputTin;

    // Header
    doc.setFillColor(116, 16, 22); // IRD Red
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(253, 224, 71); // Gold
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTMENT OF INLAND REVENUE • SRI LANKA', 105, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('FORCED REGISTRATION UNIT (FRU) - SECTION 102 6-MONTH HISTORICAL AUDIT DOSSIER', 105, 17, { align: 'center' });

    // Taxpayer details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Taxpayer Identification Number (TIN): ${tinLabel}`, 14, 32);
    doc.setFont('helvetica', 'normal');
    doc.text(`Taxpayer Name: ${matchedRecord.name}`, 14, 38);
    doc.text(`NIC / BRN: ${matchedRecord.nic || matchedRecord.brn || 'N/A'}`, 14, 44);
    doc.text(`Investigation Scope: Past 6 Months (Reference Cutoff: ${referenceDate.toISOString().split('T')[0]})`, 14, 50);

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 55, 182, 24, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.rect(14, 55, 182, 24, 'S');

    doc.setFont('helvetica', 'bold');
    doc.text(`Total 6-Month Turnover: LKR ${Math.round(aggregatedStats.totalTurnover).toLocaleString()}`, 20, 63);
    doc.text(`Total Transactions Ingested: ${aggregatedStats.txCount}`, 20, 71);
    doc.text(`Estimated Potential VAT Exposure: LKR ${Math.round(aggregatedStats.estVat).toLocaleString()}`, 110, 63);
    doc.text(`Estimated SSCL Exposure: LKR ${Math.round(aggregatedStats.estSscl).toLocaleString()}`, 110, 71);

    // Table of 6-Month Transactions
    const tableData = filteredTransactions.map((tx, idx) => [
      idx + 1,
      tx.date || 'N/A',
      tx.agency || matchedRecord.primaryAgency || 'N/A',
      tx.category || 'Economic Activity',
      `LKR ${Math.round(Number(tx.amount) || 0).toLocaleString()}`,
      tx.description || 'Statutory Transaction Entry',
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['#', 'Transaction Date', 'Agency / Source', 'Category', 'Turnover (LKR)', 'Description']],
      body: tableData,
      headStyles: { fillColor: [116, 16, 22], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
    });

    const finalY = doc.lastAutoTable?.finalY || 180;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated by Officer: ${activeOfficer ? activeOfficer.name : 'Authorized Assessor'} on ${new Date().toLocaleString()}`,
      14,
      finalY + 12
    );

    doc.save(`IRD_TIN_${tinLabel}_6_Month_Audit_Report.pdf`);
  };

  // Export 6-Month Historical Data as Excel
  const handleExportExcel = () => {
    if (!matchedRecord) return;
    const wb = XLSX.utils.book_new();
    const tinLabel = matchedRecord.tin || inputTin;

    const rows = filteredTransactions.map((tx, idx) => ({
      '#': idx + 1,
      'TIN Number': tinLabel,
      'Taxpayer Name': matchedRecord.name,
      'NIC / BRN': matchedRecord.nic || matchedRecord.brn,
      'Transaction Date': tx.date || 'N/A',
      'Source Agency': tx.agency || matchedRecord.primaryAgency,
      'Category': tx.category || 'N/A',
      'Transaction Turnover (LKR)': Math.round(Number(tx.amount) || 0),
      'Description': tx.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'TIN 6-Month Ledger');
    XLSX.writeFile(wb, `IRD_TIN_${tinLabel}_6_Month_Data.xlsx`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 28px',
          background: 'linear-gradient(180deg, #0e0204 0%, #080102 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          borderTop: '3.5px solid #741016',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(116, 16, 22, 0.35)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', paddingBottom: '14px', marginBottom: '18px' }}>
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
                color: '#fde047',
              }}
            >
              <History size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>
                TIN 6-Month Historical Intelligence & Audit Tracker
              </h3>
              <span style={{ fontSize: '12px', color: '#fde047', fontWeight: 600 }}>
                බදු අංකය (TIN) මඟින් පසුගිය මාස 6 ක ආර්ථික ගනුදෙනු හා අනුකූලතා විමර්ශනය
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '4px 8px', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '18px', background: 'rgba(0, 0, 0, 0.45)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
          {/* TIN Input */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
              Enter or Select Taxpayer TIN / NIC
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={inputTin}
                onChange={(e) => setInputTin(e.target.value)}
                placeholder="e.g. 102938475 or NIC..."
                className="form-control"
                style={{ paddingLeft: '38px', fontSize: '13px', background: '#090203', borderColor: '#d4af37', color: '#ffffff' }}
                autoFocus
              />
            </div>
          </div>

          {/* Quick-select Autocomplete from dataset */}
          {availableTins.length > 0 && (
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                Quick Pick from Uploaded Data ({availableTins.length})
              </label>
              <select
                value={inputTin}
                onChange={(e) => setInputTin(e.target.value)}
                className="form-select"
                style={{ fontSize: '12px', background: '#090203', borderColor: 'rgba(212, 175, 55, 0.35)', color: '#ffffff' }}
              >
                <option value="">-- Choose Loaded TIN --</option>
                {availableTins.map((item) => (
                  <option key={item.tin} value={item.tin}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Range Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Historical Window
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setSelectedRange('6M')}
                className={`btn btn-xs ${selectedRange === '6M' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 700, fontSize: '11px', padding: '4px 10px' }}
              >
                Past 6 Months (මාස 6)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('3M')}
                className={`btn btn-xs ${selectedRange === '3M' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 700, fontSize: '11px', padding: '4px 8px' }}
              >
                3 Months
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('1M')}
                className={`btn btn-xs ${selectedRange === '1M' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 700, fontSize: '11px', padding: '4px 8px' }}
              >
                1 Month
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('ALL')}
                className={`btn btn-xs ${selectedRange === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 700, fontSize: '11px', padding: '4px 8px' }}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          {!inputTin.trim() ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Search size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px auto', opacity: 0.7 }} />
              <h4 style={{ fontSize: '15px', color: '#ffffff', margin: '0 0 6px 0' }}>
                TIN අංකයක් ඇතුළත් කරන්න (Enter a TIN Number)
              </h4>
              <p style={{ fontSize: '12px', maxWidth: '480px', margin: '0 auto' }}>
                බදු ගෙවන්නාගේ TIN අංකය ඉහතින් ඇතුළත් කර පසුගිය මාස 6 තුළ සිදු වූ ගනුදෙනු, පිරිවැටුම සහ බදු වගකීම් ක්ෂණිකව පරික්ෂා කරන්න.
              </p>
            </div>
          ) : !matchedRecord ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px' }}>
              <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '15px', color: '#f87171', margin: '0 0 6px 0' }}>
                TIN No. "{inputTin}" හමු නොවීය (Entity Not Found in Loaded Datasets)
              </h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1', maxWidth: '520px', margin: '0 auto' }}>
                මෙම TIN අංකයට අදාළ දත්ත දැනට පද්ධතියට උඩුගත කළ (Imported) Excel ගොනු තුළ හමු නොවීය. කරුණාකර අංකය නිවැරදිදැයි පරීක්ෂා කරන්න හෝ අදාළ බදු දත්ත ගොනුව Step 1 හරහා Upload කරන්න.
              </p>
            </div>
          ) : (
            <>
              {/* Taxpayer Entity Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(116, 16, 22, 0.25)', border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '10px', padding: '14px 18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#fde047', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Verified Entity
                    </span>
                    <span className="badge badge-low" style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {matchedRecord.hasTIN ? 'Registered TIN Active' : 'Unregistered Taxpayer'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px 0' }}>
                    {matchedRecord.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    <strong>TIN:</strong> <span style={{ color: '#fde047', fontWeight: 700 }}>{matchedRecord.tin || inputTin}</span> •{' '}
                    <strong>NIC:</strong> {matchedRecord.nic || 'N/A'} •{' '}
                    <strong>BRN:</strong> {matchedRecord.brn || 'N/A'} •{' '}
                    <strong>Office:</strong> {matchedRecord.regionalOffice}
                  </div>
                </div>

                {/* Export Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11.5px', gap: '6px', color: '#fde047', borderColor: 'rgba(212, 175, 55, 0.5)' }}
                  >
                    <Download size={13} />
                    <span>6-Month PDF Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11.5px', gap: '6px' }}
                  >
                    <FileText size={13} />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* 6-Month Aggregated Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="glass-card" style={{ padding: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    6-Month Total Turnover
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#fde047', margin: '4px 0' }}>
                    LKR {Math.round(aggregatedStats.totalTurnover).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Across {aggregatedStats.txCount} recorded transactions
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    VAT Threshold Status
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: aggregatedStats.totalTurnover >= 60000000 ? '#f87171' : '#34d399', margin: '4px 0' }}>
                    {aggregatedStats.totalTurnover >= 60000000 ? 'BREACHED (Liable)' : 'Under Statutory Threshold'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Est. VAT (18%): LKR {Math.round(aggregatedStats.estVat).toLocaleString()}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    SSCL Threshold Status
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: aggregatedStats.totalTurnover >= 120000000 ? '#f87171' : '#34d399', margin: '4px 0' }}>
                    {aggregatedStats.totalTurnover >= 120000000 ? 'BREACHED (Liable)' : 'Under Threshold (LKR 120M)'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Est. SSCL (2.5%): LKR {Math.round(aggregatedStats.estSscl).toLocaleString()}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Source Agencies (6-Month)
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>
                    {aggregatedStats.agencies.length > 0 ? aggregatedStats.agencies.join(', ') : matchedRecord.primaryAgency}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Cross-verification active
                  </div>
                </div>
              </div>

              {/* Monthly Trend Breakdown for the 6-Month Period */}
              {aggregatedStats.monthlyBuckets.length > 0 && (
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <TrendingUp size={16} color="#fde047" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
                      මාසික ප්‍රගතිය (6-Month Monthly Timeline Breakdown)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(aggregatedStats.monthlyBuckets.length, 1)}, 1fr)`, gap: '8px', overflowX: 'auto' }}>
                    {aggregatedStats.monthlyBuckets.map((bucket) => (
                      <div
                        key={bucket.key}
                        style={{
                          background: 'rgba(28, 4, 7, 0.8)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '8px',
                          padding: '10px',
                          textAlign: 'center',
                          minWidth: '110px',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{bucket.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#fde047', margin: '4px 0' }}>
                          LKR {Math.round(bucket.amount).toLocaleString()}
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          {bucket.count} entries
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction Ledger Table */}
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                    6-Month Historical Transaction Ledger ({filteredTransactions.length} Records)
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Sorted by chronology
                  </span>
                </div>

                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  <table className="table" style={{ fontSize: '12px', margin: 0 }}>
                    <thead>
                      <tr style={{ background: 'rgba(116, 16, 22, 0.35)', color: '#fde047' }}>
                        <th style={{ padding: '8px 12px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>Date</th>
                        <th style={{ padding: '8px 12px' }}>Source Agency</th>
                        <th style={{ padding: '8px 12px' }}>Category</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Turnover (LKR)</th>
                        <th style={{ padding: '8px 12px' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#ffffff' }}>{tx.date || 'N/A'}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                              {tx.agency || matchedRecord.primaryAgency}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>{tx.category || 'General'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#fde047' }}>
                            {Math.round(Number(tx.amount) || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                            {tx.description || 'Statutory economic transaction'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Statutory Investigations under Section 102 Inland Revenue Act No. 24 of 2017
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
}

