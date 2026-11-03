/**
 * Excel & CSV Processing and Master File Generation using SheetJS (xlsx)
 */

import * as XLSX from 'xlsx';

// Column synonym dictionaries for automatic intelligent mapping
const SYNONYMS = {
  nic: ['nic', 'nic_no', 'nic_number', 'national_id', 'identity_no', 'id_number', 'id_no', 'id', 'ජා.හැ.අංකය', 'හැඳුනුම්පත් අංකය'],
  brn: ['brn', 'br_number', 'business_reg_no', 'company_reg_no', 'reg_number', 'pv_number', 'business_registration'],
  tin: ['tin', 'tin_no', 'tin_number', 'tax_id', 'tax_pin', 'ramis_tin', 'taxpayer_id', 'බදු අංකය'],
  name: ['name', 'full_name', 'taxpayer_name', 'business_name', 'entity_name', 'owner_name', 'customer_name', 'importer_name', 'buyer_name', 'නම'],
  address: ['address', 'full_address', 'registered_address', 'permanent_address', 'postal_address', 'location', 'ලිපිනය'],
  phone: ['phone', 'mobile', 'contact_no', 'tel', 'telephone', 'mobile_no', 'දුරකථන'],
  email: ['email', 'email_address', 'e_mail'],
  turnover: ['turnover', 'amount', 'transaction_value', 'cif_value', 'fob_value', 'total_amount', 'income', 'value_lkr', 'total_value', 'customs_value', 'vehicle_value', 'annual_turnover', 'ගනුදෙනු වටිනාකම'],
  agency: ['agency', 'source', 'data_source', 'department', 'origin', 'institution', 'source_agency', 'ආයතනය'],
  txDate: ['date', 'tx_date', 'transaction_date', 'import_date', 'reg_date', 'year', 'yoa', 'දිනය'],
  category: ['category', 'sector', 'business_type', 'trade_type', 'vehicle_type', 'item_category'],
  description: ['description', 'item_description', 'goods_description', 'remarks', 'notes', 'details'],
};

/**
 * Read uploaded file (ArrayBuffer or File) and return sheets & data
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const sheetNames = workbook.SheetNames;
        const sheetsData = {};

        sheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Get headers and rows as JSON objects
          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
          // Get raw header list
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
          const headers = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
            if (cell && cell.v) headers.push(String(cell.v).trim());
          }

          sheetsData[sheetName] = {
            headers: headers.length > 0 ? headers : (rows.length > 0 ? Object.keys(rows[0]) : []),
            rows,
            rowCount: rows.length,
          };
        });

        const displayName = file._folderPath || file.webkitRelativePath || file.name;

        resolve({
          fileName: displayName,
          baseName: file.name,
          folderPath: file._folderPath || file.webkitRelativePath || '',
          sheetNames,
          sheetsData,
        });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Error reading uploaded file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read and process multiple uploaded files (Excel / CSV)
 * Creates individual file sheets as well as a master consolidated merged dataset
 */
export async function parseMultipleExcelFiles(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) throw new Error('No files provided');

  const fileResults = await Promise.all(files.map((file) => parseExcelFile(file)));

  // If only 1 file uploaded
  if (fileResults.length === 1) {
    const single = fileResults[0];
    return {
      ...single,
      isMultiFile: false,
      filesSummary: [
        {
          name: single.fileName,
          size: files[0].size,
          sheets: single.sheetNames,
          totalRows: Object.values(single.sheetsData).reduce((sum, s) => sum + s.rowCount, 0),
        },
      ],
      allFiles: fileResults,
    };
  }

  // Multi-file: Build consolidated / merged sheet + individual file sheets
  const sheetNames = [];
  const sheetsData = {};
  const filesSummary = [];

  let allMergedRows = [];
  const mergedHeadersSet = new Set();

  fileResults.forEach((res, fileIdx) => {
    const origFile = files[fileIdx];
    let fileTotalRows = 0;

    res.sheetNames.forEach((sName) => {
      const uniqueSheetKey =
        res.sheetNames.length === 1 ? res.fileName : `${res.fileName} • ${sName}`;

      const sData = res.sheetsData[sName];
      sheetNames.push(uniqueSheetKey);
      sheetsData[uniqueSheetKey] = sData;
      fileTotalRows += sData.rowCount;

      // Collect unique headers
      sData.headers.forEach((h) => mergedHeadersSet.add(h));

      // Tag each row with its source file name
      const taggedRows = sData.rows.map((r) => ({
        ...r,
        _Source_File: res.fileName,
      }));
      allMergedRows = allMergedRows.concat(taggedRows);
    });

    filesSummary.push({
      name: res.fileName,
      baseName: origFile.name,
      folderPath: origFile._folderPath || origFile.webkitRelativePath || '',
      size: origFile.size,
      sheets: res.sheetNames,
      totalRows: fileTotalRows,
    });
  });

  // Consolidated master sheet
  const mergedSheetName = `Consolidated (${files.length} Files Merged)`;
  mergedHeadersSet.add('_Source_File');
  const mergedHeaders = Array.from(mergedHeadersSet);

  sheetsData[mergedSheetName] = {
    headers: mergedHeaders,
    rows: allMergedRows,
    rowCount: allMergedRows.length,
    isMerged: true,
  };

  return {
    fileName: `${files.length} Files (${allMergedRows.length} Total Records)`,
    isMultiFile: true,
    sheetNames: [mergedSheetName, ...sheetNames],
    sheetsData,
    filesSummary,
    allFiles: fileResults,
  };
}

/**
 * Auto-detect column mappings based on headers
 */
export function autoDetectColumnMapping(headers = []) {
  const mapping = {
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
  };

  const normalizedHeaders = headers.map((h) => ({
    original: h,
    cleaned: String(h).toLowerCase().replace(/[^a-z0-9]/g, '_'),
  }));

  for (const [field, synonymList] of Object.entries(SYNONYMS)) {
    // Priority 1: Exact match
    const exact = normalizedHeaders.find((h) => synonymList.includes(h.cleaned));
    if (exact) {
      mapping[field] = exact.original;
      continue;
    }

    // Priority 2: Substring inclusion match
    const partial = normalizedHeaders.find((h) =>
      synonymList.some((s) => h.cleaned.includes(s) || s.includes(h.cleaned))
    );
    if (partial) {
      mapping[field] = partial.original;
    }
  }

  // If no explicit agency column detected, map '_Source_File' automatically for multi-file imports
  if (!mapping.agency && headers.includes('_Source_File')) {
    mapping.agency = '_Source_File';
  }

  return mapping;
}

/**
 * Generate and Download the Complete Multi-Tab IRD Master Excel File
 * Preserves all original columns from the user's uploaded Excel file in their exact original order
 */
export function exportMasterExcelFile(
  records,
  summary,
  fileName = 'IRD_Forced_Registration_Unit_Master_File.xlsx',
  originalHeaders = [],
  rawRows = []
) {
  const wb = XLSX.utils.book_new();

  // Extract all original headers if not explicitly passed
  let allOriginalCols = originalHeaders && originalHeaders.length > 0 ? [...originalHeaders] : [];
  if (allOriginalCols.length === 0 && records.length > 0) {
    const sampleRaw = records[0].rawRow || records[0].transactions?.[0]?.rawRow;
    if (sampleRaw) {
      allOriginalCols = Object.keys(sampleRaw);
    }
  }

  // Tab 1: Comprehensive Master Register - Exactly preserving all original uploaded columns first
  const masterData = records.map((r) => {
    const raw = r.rawRow || r.transactions?.[0]?.rawRow || {};
    const rowObj = {};

    // 1. EXACT ORIGINAL EXCEL COLUMNS IN ORIGINAL ORDER
    allOriginalCols.forEach((col) => {
      rowObj[col] = raw[col] !== undefined && raw[col] !== null ? raw[col] : '';
    });

    // 2. ENRICHED IRD STATUTORY AUDIT COLUMNS
    rowObj['[IRD] Master Ref ID'] = r.id;
    rowObj['[IRD] Standardized NIC'] = r.nic;
    rowObj['[IRD] NIC Status'] = r.nicDetails?.isValid
      ? `Valid (${r.nicDetails.format})`
      : (r.nic ? `INVALID: ${r.nicDetails?.error}` : 'Missing');
    rowObj['[IRD] Date of Birth'] = r.nicDetails?.dob || 'N/A';
    rowObj['[IRD] Gender'] = r.nicDetails?.gender || 'N/A';
    rowObj['[IRD] Age'] = r.nicDetails?.age !== null && r.nicDetails?.age !== undefined ? r.nicDetails.age : 'N/A';
    rowObj['[IRD] BRN'] = r.brn || 'N/A';
    rowObj['[IRD] Existing TIN'] = r.tin || 'UNREGISTERED';
    rowObj['[IRD] TIN Status'] = r.hasTIN ? 'Registered' : 'FORCED REGISTRATION REQUIRED';
    rowObj['[IRD] Total Aggregated Turnover (LKR)'] = r.totalTurnover;
    rowObj['[IRD] Aggregated Transactions'] = r.transactionCount;
    rowObj['[IRD] Registered Address'] = r.address || '';
    rowObj['[IRD] District'] = r.district || '';
    rowObj['[IRD] Assigned Regional Office'] = r.regionalOffice || '';
    rowObj['[IRD] Regional Unit'] = r.assignedUnit || '';
    rowObj['[IRD] Contact Phone'] = r.phone || 'N/A';
    rowObj['[IRD] Email Address'] = r.email || 'N/A';
    rowObj['[IRD] Primary Agency Source'] = r.primaryAgency || '';
    rowObj['[IRD] Risk Level'] = r.riskLevel || 'LOW';
    rowObj['[IRD] Risk Score (0-100)'] = r.riskScore || 0;
    rowObj['[IRD] Primary Action Recommendation'] = r.primaryAction || '';
    rowObj['[IRD] VAT Liable (>=60M)'] = r.isVatBreached ? 'YES (Breached Threshold)' : 'No';
    rowObj['[IRD] SSCL Liable (>=120M)'] = r.isSsclBreached ? 'YES (Breached Threshold)' : 'No';
    rowObj['[IRD] Est. Potential Tax Exposure (LKR)'] = Math.round(r.estimatedExposure?.total || 0);
    rowObj['[IRD] Officer Review Status'] = r.reviewStatus || 'PENDING_REVIEW';
    rowObj['[IRD] Officer Notes'] = r.officerNotes || '';

    return rowObj;
  });
  const wsMaster = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, wsMaster, '1. Master Register');

  // Tab 2: Individual Source Rows with IRD Audit Flags (if rawRows available)
  if (rawRows && rawRows.length > 0) {
    const idMap = new Map();
    records.forEach((rec) => {
      if (rec.nic) idMap.set(String(rec.nic).toLowerCase(), rec);
      if (rec.tin) idMap.set(String(rec.tin).toLowerCase(), rec);
      if (rec.brn) idMap.set(String(rec.brn).toLowerCase(), rec);
      idMap.set(rec.id.toLowerCase(), rec);
    });

    const sourceRowsData = rawRows.map((row, idx) => {
      const rowCopy = { ...row };
      let matched = null;
      for (const val of Object.values(row)) {
        if (val && idMap.has(String(val).toLowerCase())) {
          matched = idMap.get(String(val).toLowerCase());
          break;
        }
      }

      rowCopy['[IRD Taxpayer Ref]'] = matched ? matched.id : `ROW-${idx + 1}`;
      rowCopy['[IRD Risk Level]'] = matched ? matched.riskLevel : 'PENDING';
      rowCopy['[IRD TIN Status]'] = matched ? (matched.hasTIN ? 'Registered' : 'FORCED REG REQUIRED') : 'UNKNOWN';
      rowCopy['[IRD Action Required]'] = matched ? matched.primaryAction : 'Review';

      return rowCopy;
    });
    const wsSource = XLSX.utils.json_to_sheet(sourceRowsData);
    XLSX.utils.book_append_sheet(wb, wsSource, '2. Source Rows Audited');
  }

  // Tab 3: High Risk Actionable Notice List
  const highRiskData = records
    .filter((r) => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH' || r.reviewStatus === 'APPROVED_FOR_NOTICE')
    .map((r) => ({
      'Master Ref ID': r.id,
      'Taxpayer Name': r.name,
      'NIC Number': r.nic,
      'BRN': r.brn,
      'Total Value (LKR)': r.totalTurnover,
      'Notice Section': 'Section 102 (Inland Revenue Act No. 24 of 2017)',
      'Compulsory Taxes': [
        !r.hasTIN ? 'TIN' : null,
        r.isVatBreached ? 'VAT' : null,
        r.isSsclBreached ? 'SSCL' : null,
      ].filter(Boolean).join(', '),
      'Estimated Tax Liability (LKR)': Math.round(r.estimatedExposure.total),
      'Assigned Regional Office': r.regionalOffice,
      'Address': r.address,
      'Contact': r.phone,
      'Source Agency': r.primaryAgency,
      'Action Required': r.primaryAction,
    }));
  const wsHighRisk = XLSX.utils.json_to_sheet(highRiskData);
  XLSX.utils.book_append_sheet(wb, wsHighRisk, '3. Actionable Notices');

  // Tab 4: VAT & SSCL Commercial Threshold Breaches
  const vatData = records
    .filter((r) => r.isVatBreached || r.isSsclBreached)
    .map((r) => ({
      'Master Ref ID': r.id,
      'Business / Taxpayer Name': r.name,
      'NIC / BRN': r.nic || r.brn,
      'Annual Turnover (LKR)': r.totalTurnover,
      'VAT Threshold Status': r.isVatBreached ? 'BREACHED (Liable for 18% VAT)' : 'Below',
      'SSCL Threshold Status': r.isSsclBreached ? 'BREACHED (Liable for 2.5% SSCL)' : 'Below',
      'Est. VAT Amount (LKR)': Math.round(r.estimatedExposure.vat),
      'Est. SSCL Amount (LKR)': Math.round(r.estimatedExposure.sscl),
      'Assigned Office': r.regionalOffice,
    }));
  const wsVat = XLSX.utils.json_to_sheet(vatData);
  XLSX.utils.book_append_sheet(wb, wsVat, '4. VAT & SSCL Breaches');

  // Tab 5: Exceptions & Invalid NICs
  const exceptionData = records
    .filter((r) => (r.nic && !r.nicDetails.isValid) || !r.address)
    .map((r) => ({
      'Master Ref ID': r.id,
      'Taxpayer Name': r.name,
      'Provided NIC': r.nic,
      'NIC Error Reason': r.nicDetails.error || 'N/A',
      'Provided Address': r.address || 'MISSING',
      'Turnover (LKR)': r.totalTurnover,
      'Source Agency': r.primaryAgency,
      'Investigation Action': 'Physical inspection & document verification required',
    }));
  const wsExceptions = XLSX.utils.json_to_sheet(exceptionData);
  XLSX.utils.book_append_sheet(wb, wsExceptions, '5. Data Exceptions');

  // Tab 6: Executive Statistics
  const summaryRows = [
    { 'Metric': 'Total Taxpayer Entities Analyzed', 'Value': summary.totalRecords },
    { 'Metric': 'Total Aggregated Economic Turnover (LKR)', 'Value': summary.totalTurnoverSum.toLocaleString() },
    { 'Metric': 'Total Estimated Potential Tax Exposure (LKR)', 'Value': Math.round(summary.totalEstimatedTaxExposure).toLocaleString() },
    { 'Metric': 'Unregistered Entities (Forced TIN Required)', 'Value': summary.unregisteredCount },
    { 'Metric': 'Registered Entities with Existing TIN', 'Value': summary.registeredCount },
    { 'Metric': 'VAT Threshold Breaches (Turnover >= 60M)', 'Value': summary.vatBreachCount },
    { 'Metric': 'SSCL Threshold Breaches (Turnover >= 120M)', 'Value': summary.ssclBreachCount },
    { 'Metric': 'Critical Risk Priority Cases', 'Value': summary.criticalRiskCount },
    { 'Metric': 'High Risk Priority Cases', 'Value': summary.highRiskCount },
    { 'Metric': 'Invalid NIC Formats Requiring Audit', 'Value': summary.invalidNicCount },
    { 'Metric': 'Original Excel Columns Preserved', 'Value': `${allOriginalCols.length} Columns Intact` },
    { 'Metric': 'System Intelligence Engine', 'Value': 'Powered by Novix Solutions' },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, '6. Executive Statistics');

  // Write and download
  XLSX.writeFile(wb, fileName);
}
