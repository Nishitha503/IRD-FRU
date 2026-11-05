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
 * Clean and normalize a header string by trimming whitespace and stripping non-printable chars
 */
export function cleanHeaderName(h) {
  if (h === null || h === undefined) return '';
  return String(h)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Determine if a column is a ghost, blank, or SheetJS placeholder column (e.g. __EMPTY, _1)
 */
export function isGhostOrEmptyColumn(h) {
  if (!h) return true;
  const s = String(h).trim();
  if (s === '') return true;
  if (/^__EMPTY(_\d+)?$/i.test(s)) return true;
  if (/^_\d+$/.test(s)) return true;
  return false;
}

/**
 * Normalize a column string for comparison (removes spaces, punctuation, underscores)
 */
export function normalizeKey(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Smart synonym comparison with length-aware word boundary safety
 */
export function matchesSynonym(header, synonym) {
  const h = normalizeKey(header);
  const s = normalizeKey(synonym);
  if (!h || !s) return false;
  if (h === s) return true;
  if (s.length <= 3) {
    return h === s || h.startsWith(s + '_') || h.endsWith('_' + s) || h === (s + 'no') || h === (s + 'number');
  }
  return h.includes(s) || (s.length > 5 && s.includes(h));
}

/**
 * Find matching base column from the Master Schema for an incoming column
 */
export function findMatchingBaseColumn(incomingCol, baseColumns = []) {
  const cleanIncoming = cleanHeaderName(incomingCol);
  if (!cleanIncoming || isGhostOrEmptyColumn(cleanIncoming)) return null;

  // 1. Exact case-insensitive match
  const exact = baseColumns.find((b) => cleanHeaderName(b).toLowerCase() === cleanIncoming.toLowerCase());
  if (exact) return exact;

  // 2. Normalized alphanumeric match
  const normIn = normalizeKey(cleanIncoming);
  const normMatch = baseColumns.find((b) => normalizeKey(b) === normIn);
  if (normMatch) return normMatch;

  // 3. Synonym dictionary matching
  for (const [concept, list] of Object.entries(SYNONYMS)) {
    const inMatchesConcept = list.some((s) => matchesSynonym(cleanIncoming, s));
    if (inMatchesConcept) {
      const baseMatch = baseColumns.find((b) => list.some((s) => matchesSynonym(b, s)));
      if (baseMatch) return baseMatch;
    }
  }

  return null;
}

/**
 * Read uploaded file (ArrayBuffer or File) and return sanitized sheets & data
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
          // Get raw rows as JSON objects
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

          // Get decoded range
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
          const rawHeaderList = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
            const val = cell && cell.v !== undefined && cell.v !== null ? cleanHeaderName(cell.v) : '';
            if (val && !isGhostOrEmptyColumn(val)) {
              rawHeaderList.push(val);
            }
          }

          // Also check keys in rawRows[0] if rawHeaderList is empty
          let headers = rawHeaderList;
          if (headers.length === 0 && rawRows.length > 0) {
            headers = Object.keys(rawRows[0])
              .map(cleanHeaderName)
              .filter((k) => !isGhostOrEmptyColumn(k));
          }

          // Deduplicate headers while preserving order
          const seenHeaders = new Set();
          const cleanHeaders = [];
          headers.forEach((h) => {
            if (!seenHeaders.has(h)) {
              seenHeaders.add(h);
              cleanHeaders.push(h);
            }
          });

          // Sanitize every row: remove ghost columns and trim header keys
          const sanitizedRows = [];
          rawRows.forEach((r) => {
            const cleanRow = {};
            let hasAnyData = false;

            Object.entries(r).forEach(([k, v]) => {
              const cleanK = cleanHeaderName(k);
              if (!isGhostOrEmptyColumn(cleanK)) {
                cleanRow[cleanK] = v !== undefined && v !== null ? v : '';
                if (String(cleanRow[cleanK]).trim() !== '') {
                  hasAnyData = true;
                }
              }
            });

            // Discard completely empty trailing or formatted rows
            if (hasAnyData) {
              sanitizedRows.push(cleanRow);
            }
          });

          sheetsData[sheetName] = {
            headers: cleanHeaders,
            rows: sanitizedRows,
            rowCount: sanitizedRows.length,
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
 * Intelligently harmonizes column schemas across files so zero duplicate/extra columns are spawned
 */
export async function parseMultipleExcelFiles(fileList, options = {}) {
  const {
    strictBaseSchema = true, // When true, aligns all subsequent files strictly to File 1's columns
    includeSourceFile = false, // When false, does not create an extra _Source_File column
    excludedColumns = [],
  } = options;

  const files = Array.from(fileList || []);
  if (files.length === 0) throw new Error('No files provided');

  const fileResults = await Promise.all(files.map((file) => parseExcelFile(file)));

  // If only 1 file uploaded
  if (fileResults.length === 1) {
    const single = fileResults[0];
    const excludedSet = new Set(excludedColumns || []);
    if (excludedSet.size > 0) {
      Object.keys(single.sheetsData).forEach((sName) => {
        const s = single.sheetsData[sName];
        s.headers = s.headers.filter((h) => !excludedSet.has(h));
      });
    }

    const firstHeaders = Object.values(single.sheetsData)[0]?.headers || [];
    return {
      ...single,
      isMultiFile: false,
      filesSummary: [
        {
          name: single.fileName,
          size: files[0].size,
          sheets: single.sheetNames,
          totalRows: Object.values(single.sheetsData).reduce((sum, s) => sum + s.rowCount, 0),
          columnsCount: firstHeaders.length,
        },
      ],
      allFiles: fileResults,
      baseColumns: firstHeaders,
      extraColumnsDiscovered: [],
      harmonizedStats: {
        baseColumnsCount: firstHeaders.length,
        finalColumnsCount: firstHeaders.length,
        extraColumnsEliminated: 0,
        strictBaseSchema,
      },
    };
  }

  // Multi-file: Build consolidated / merged sheet + individual file sheets
  const sheetNames = [];
  const sheetsData = {};
  const filesSummary = [];

  // Determine Base Schema from File 1 (first sheet of first file)
  const firstFile = fileResults[0];
  const firstSheetName = firstFile.sheetNames[0];
  const rawBaseHeaders = firstFile.sheetsData[firstSheetName]?.headers || [];
  const baseHeaders = rawBaseHeaders.filter((h) => !isGhostOrEmptyColumn(h));

  const canonicalHeaders = [...baseHeaders];
  const canonicalSet = new Set(baseHeaders);
  const extraColumnsDiscovered = new Set();
  let extraColumnsEliminatedCount = 0;

  let allMergedRows = [];

  fileResults.forEach((res, fileIdx) => {
    const origFile = files[fileIdx];
    let fileTotalRows = 0;

    res.sheetNames.forEach((sName) => {
      const uniqueSheetKey =
        res.sheetNames.length === 1 ? res.fileName : `${res.fileName} • ${sName}`;

      const sData = res.sheetsData[sName];
      sheetNames.push(uniqueSheetKey);
      fileTotalRows += sData.rowCount;

      // Build column mapping from this sheet's columns to canonical base columns
      const columnAlignMap = new Map();

      sData.headers.forEach((incomingCol) => {
        if (isGhostOrEmptyColumn(incomingCol)) return;

        // Try to match with existing canonical base headers
        const matchedBase = findMatchingBaseColumn(incomingCol, canonicalHeaders);
        if (matchedBase) {
          columnAlignMap.set(incomingCol, matchedBase);
        } else {
          // Column does not match any existing base column
          extraColumnsDiscovered.add(incomingCol);
          if (!strictBaseSchema) {
            if (!canonicalSet.has(incomingCol)) {
              canonicalSet.add(incomingCol);
              canonicalHeaders.push(incomingCol);
            }
            columnAlignMap.set(incomingCol, incomingCol);
          } else {
            extraColumnsEliminatedCount++;
          }
        }
      });

      // Align and transform rows so all keys strictly match canonical headers
      const alignedRows = sData.rows.map((r) => {
        const alignedRow = {};

        // 1. Initialize canonical headers with empty values
        canonicalHeaders.forEach((ch) => {
          alignedRow[ch] = '';
        });

        // 2. Populate values using the column alignment mapping
        Object.entries(r).forEach(([rawKey, val]) => {
          if (isGhostOrEmptyColumn(rawKey)) return;

          const targetCol = columnAlignMap.get(rawKey);
          if (targetCol && canonicalSet.has(targetCol)) {
            if (val !== undefined && val !== null && String(val).trim() !== '') {
              alignedRow[targetCol] = val;
            }
          }
        });

        // 3. Optional _Source_File column
        if (includeSourceFile) {
          alignedRow['_Source_File'] = res.fileName;
        }

        return alignedRow;
      });

      sheetsData[uniqueSheetKey] = {
        headers: sData.headers,
        rows: sData.rows,
        rowCount: sData.rowCount,
      };

      allMergedRows = allMergedRows.concat(alignedRows);
    });

    filesSummary.push({
      name: res.fileName,
      baseName: origFile.name,
      folderPath: origFile._folderPath || origFile.webkitRelativePath || '',
      size: origFile.size,
      sheets: res.sheetNames,
      totalRows: fileTotalRows,
      columnsCount: res.sheetsData[res.sheetNames[0]]?.headers?.length || 0,
    });
  });

  // Final Merged Headers
  const finalMergedHeaders = [...canonicalHeaders];
  if (includeSourceFile && !finalMergedHeaders.includes('_Source_File')) {
    finalMergedHeaders.push('_Source_File');
  }

  // Filter out any explicitly excluded columns
  const excludedSet = new Set(excludedColumns || []);
  const cleanMergedHeaders = finalMergedHeaders.filter((h) => !excludedSet.has(h));

  const mergedSheetName = `Consolidated (${files.length} Files Merged)`;
  sheetsData[mergedSheetName] = {
    headers: cleanMergedHeaders,
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
    baseColumns: baseHeaders,
    extraColumnsDiscovered: Array.from(extraColumnsDiscovered),
    harmonizedStats: {
      baseColumnsCount: baseHeaders.length,
      finalColumnsCount: cleanMergedHeaders.length,
      extraColumnsEliminated: extraColumnsEliminatedCount,
      strictBaseSchema,
    },
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
      allOriginalCols = Object.keys(sampleRaw).filter((k) => !isGhostOrEmptyColumn(k));
    }
  }

  // Strictly filter out any ghost or empty columns
  allOriginalCols = allOriginalCols.filter((k) => !isGhostOrEmptyColumn(k));

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

/**
 * Generate and Download Clean Master File with ONLY the Original Columns
 * Perfect for re-uploading to RAMIS or external government systems with ZERO extra columns
 */
export function exportCleanOriginalExcelFile(
  records,
  fileName = 'IRD_Consolidated_Clean_Original_Data.xlsx',
  originalHeaders = [],
  rawRows = []
) {
  const wb = XLSX.utils.book_new();

  let allOriginalCols = originalHeaders && originalHeaders.length > 0 ? [...originalHeaders] : [];
  if (allOriginalCols.length === 0 && records.length > 0) {
    const sampleRaw = records[0].rawRow || records[0].transactions?.[0]?.rawRow;
    if (sampleRaw) {
      allOriginalCols = Object.keys(sampleRaw).filter((k) => !isGhostOrEmptyColumn(k));
    }
  }

  // Strictly filter out any ghost or empty columns
  allOriginalCols = allOriginalCols.filter((k) => !isGhostOrEmptyColumn(k));

  // Build rows with ONLY original columns
  const cleanData = records.map((r) => {
    const raw = r.rawRow || r.transactions?.[0]?.rawRow || {};
    const rowObj = {};
    allOriginalCols.forEach((col) => {
      rowObj[col] = raw[col] !== undefined && raw[col] !== null ? raw[col] : '';
    });
    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(cleanData);
  XLSX.utils.book_append_sheet(wb, ws, 'Consolidated Original Data');
  XLSX.writeFile(wb, fileName);
}
