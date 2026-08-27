/**
 * IRD Forced Registration Business Logic & Rule Engine
 * Implements Sri Lanka Inland Revenue Act No. 24 of 2017 (Section 102 Forced Registration)
 */

import { parseSriLankanNIC } from './nicValidator';
import { parseSriLankanTIN, parseSriLankanBRN } from './tinValidator';
import { detectDistrictFromAddress } from './districtMapping';

export const DEFAULT_RULES = {
  mandatoryTinAge: 18,
  individualIncomeThreshold: 1200000, // LKR 1.2M / YOA
  vatAnnualThreshold: 60000000,       // LKR 60M / YOA (or 15M/quarter)
  ssclAnnualThreshold: 120000000,     // LKR 120M / YOA
  highValueTransactionThreshold: 10000000, // LKR 10M
  vatRate: 0.18,                      // 18% VAT
  ssclRate: 0.025,                    // 2.5% SSCL
  incomeTaxAvgRate: 0.15,             // Estimated average effective tax bracket for high earners
};

/**
 * Clean and parse numeric currency amounts from Excel cells (e.g. "Rs. 1,500,000.00" -> 1500000)
 */
export function parseCurrency(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Analyze mapped raw rows and produce consolidated Master File records
 * Preserves all original Excel columns exactly as uploaded
 */
export function analyzeRawData(rawRows, columnMapping, ruleConfig = DEFAULT_RULES, originalHeaders = []) {
  const rules = { ...DEFAULT_RULES, ...ruleConfig };
  const consolidatedMap = new Map();
  const unidentifiableRows = [];

  const headers = originalHeaders && originalHeaders.length > 0
    ? originalHeaders
    : (rawRows && rawRows.length > 0 ? Object.keys(rawRows[0]) : []);

  rawRows.forEach((row, index) => {
    // Extract mapped fields
    const rawNic = getFieldValue(row, columnMapping.nic);
    const rawBrn = getFieldValue(row, columnMapping.brn);
    const rawTin = getFieldValue(row, columnMapping.tin);
    const rawName = getFieldValue(row, columnMapping.name) || `Taxpayer_${index + 1}`;
    const rawAddress = getFieldValue(row, columnMapping.address) || '';
    const rawPhone = getFieldValue(row, columnMapping.phone) || '';
    const rawEmail = getFieldValue(row, columnMapping.email) || '';
    const rawAgency = getFieldValue(row, columnMapping.agency) || 'Third-Party Source';
    const rawTurnover = parseCurrency(getFieldValue(row, columnMapping.turnover));
    const rawTxDate = getFieldValue(row, columnMapping.txDate) || '';
    const rawDescription = getFieldValue(row, columnMapping.description) || '';
    const rawCategory = getFieldValue(row, columnMapping.category) || 'General';

    // Parse Identifiers
    const nicResult = parseSriLankanNIC(rawNic);
    const brnResult = parseSriLankanBRN(rawBrn);
    const tinResult = parseSriLankanTIN(rawTin);

    // Primary unique key for deduplication & consolidation
    let entityKey = '';
    if (nicResult.isValid) {
      entityKey = `NIC_${nicResult.standardizedNic}`;
    } else if (brnResult.isValid && brnResult.brn) {
      entityKey = `BRN_${brnResult.brn}`;
    } else if (tinResult.isValid && tinResult.tin) {
      entityKey = `TIN_${tinResult.tin}`;
    } else if (rawNic) {
      entityKey = `RAWNIC_${String(rawNic).trim().toUpperCase()}`;
    } else if (rawName && rawAddress) {
      entityKey = `NAME_ADDR_${String(rawName).trim()}_${String(rawAddress).trim().substring(0, 15)}`;
    } else {
      entityKey = `ROW_${index + 1}`;
    }

    const txRecord = {
      sourceIndex: index + 1,
      agency: rawAgency,
      amount: rawTurnover,
      date: rawTxDate,
      category: rawCategory,
      description: rawDescription,
      rawRow: row,
    };

    if (consolidatedMap.has(entityKey)) {
      const existing = consolidatedMap.get(entityKey);
      existing.totalTurnover += rawTurnover;
      existing.transactionCount += 1;
      existing.transactions.push(txRecord);
      if (!existing.allRawRows) existing.allRawRows = [existing.rawRow];
      existing.allRawRows.push({ ...row });

      // Merge original row fields so no data is lost
      Object.entries(row).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '' && (existing.rawRow[k] === undefined || String(existing.rawRow[k]).trim() === '')) {
          existing.rawRow[k] = v;
        }
      });

      if (!existing.phone && rawPhone) existing.phone = rawPhone;
      if (!existing.email && rawEmail) existing.email = rawEmail;
      if (!existing.address && rawAddress) existing.address = rawAddress;
      if (!existing.tin && tinResult.isValid) {
        existing.tin = tinResult.tin;
        existing.hasTIN = true;
      }
    } else {
      const districtInfo = detectDistrictFromAddress(rawAddress);

      consolidatedMap.set(entityKey, {
        id: `FRB-${String(consolidatedMap.size + 1).padStart(5, '0')}`,
        entityKey,
        rawRow: { ...row },
        allRawRows: [{ ...row }],
        originalHeaders: headers,
        name: String(rawName).trim(),
        nic: nicResult.standardizedNic || (rawNic ? String(rawNic).trim() : ''),
        nicDetails: nicResult,
        brn: brnResult.brn || (rawBrn ? String(rawBrn).trim() : ''),
        brnDetails: brnResult,
        tin: tinResult.isValid ? tinResult.tin : (rawTin ? String(rawTin).trim() : ''),
        hasTIN: tinResult.isValid && Boolean(tinResult.tin),
        tinDetails: tinResult,
        address: String(rawAddress).trim(),
        phone: String(rawPhone).trim(),
        email: String(rawEmail).trim(),
        district: districtInfo.district,
        regionalOffice: districtInfo.office,
        assignedUnit: districtInfo.unit,
        regionalCode: districtInfo.code,
        primaryAgency: rawAgency,
        totalTurnover: rawTurnover,
        transactionCount: 1,
        transactions: [txRecord],
        isFlaggedForNotice: false,
        reviewStatus: 'PENDING_REVIEW', // PENDING_REVIEW, APPROVED_FOR_NOTICE, INVESTIGATED, EXCLUDED
        officerNotes: '',
      });
    }
  });

  // Evaluate Business Rules & Risk Scoring on consolidated items
  const processedRecords = Array.from(consolidatedMap.values()).map((record) => {
    return evaluateRecordRiskAndActions(record, rules);
  });

  return {
    records: processedRecords,
    summary: generateAnalysisSummary(processedRecords, rules),
    originalHeaders: headers,
    rawRows,
  };
}

function getFieldValue(row, fieldKey) {
  if (!fieldKey || !row) return '';
  return row[fieldKey] !== undefined ? row[fieldKey] : '';
}

/**
 * Evaluates individual taxpayer risk score, tax liability, and forced registration recommendation
 */
export function evaluateRecordRiskAndActions(record, rules) {
  const { nicDetails, hasTIN, totalTurnover, transactions } = record;
  const isAdult = nicDetails.isValid ? (nicDetails.age >= rules.mandatoryTinAge) : true;

  let riskScore = 0;
  let riskLevel = 'LOW'; // LOW, MEDIUM, HIGH, CRITICAL
  const flags = [];
  const actionRecommendations = [];

  // Rule 1: Missing Mandatory TIN
  if (!hasTIN) {
    if (isAdult) {
      flags.push({ code: 'NO_TIN_ADULT', label: `Citizen age >= ${rules.mandatoryTinAge} without TIN`, severity: 'HIGH' });
      riskScore += 40;
    } else {
      flags.push({ code: 'NO_TIN_GENERAL', label: 'Unregistered entity with economic activity', severity: 'MEDIUM' });
      riskScore += 25;
    }
    actionRecommendations.push('FORCED_TIN_MANDATORY');
  }

  // Rule 2: VAT Registration Threshold Breach
  const isVatBreached = totalTurnover >= rules.vatAnnualThreshold;
  if (isVatBreached) {
    flags.push({
      code: 'VAT_THRESHOLD_BREACH',
      label: `Turnover (LKR ${(totalTurnover).toLocaleString()}) >= VAT Limit (LKR ${(rules.vatAnnualThreshold).toLocaleString()})`,
      severity: 'CRITICAL',
    });
    riskScore += 45;
    actionRecommendations.push('FORCED_VAT_MANDATORY');
  }

  // Rule 3: SSCL Threshold Breach
  const isSsclBreached = totalTurnover >= rules.ssclAnnualThreshold;
  if (isSsclBreached) {
    flags.push({
      code: 'SSCL_THRESHOLD_BREACH',
      label: `Turnover exceeds SSCL Limit (LKR ${(rules.ssclAnnualThreshold).toLocaleString()})`,
      severity: 'CRITICAL',
    });
    riskScore += 20;
    actionRecommendations.push('FORCED_SSCL_MANDATORY');
  }

  // Rule 4: Income Tax General Threshold
  const isIncomeTaxLiable = totalTurnover >= rules.individualIncomeThreshold;
  if (isIncomeTaxLiable && !isVatBreached) {
    flags.push({
      code: 'INCOME_TAX_THRESHOLD',
      label: `Turnover/Income exceeds tax-free threshold (LKR ${(rules.individualIncomeThreshold).toLocaleString()})`,
      severity: 'HIGH',
    });
    riskScore += 25;
  }

  // Rule 5: High Frequency / Multi-Agency Transactions
  if (transactions.length > 1) {
    flags.push({
      code: 'MULTI_TRANSACTIONS',
      label: `Aggregated ${transactions.length} separate transactions across data files`,
      severity: 'INFO',
    });
    riskScore += 10;
  }

  // Rule 6: Invalid or Questionable NIC
  if (record.nic && !nicDetails.isValid) {
    flags.push({
      code: 'INVALID_NIC_FORMAT',
      label: `NIC format error: ${nicDetails.error || 'Check digits/length invalid'}`,
      severity: 'WARNING',
    });
    riskScore += 15;
    actionRecommendations.push('AUDIT_INVESTIGATION_REQUIRED');
  }

  // Rule 7: Missing Address / Unassigned
  if (!record.address || record.address.length < 5) {
    flags.push({
      code: 'INCOMPLETE_ADDRESS',
      label: 'Address missing or insufficient for notice delivery',
      severity: 'WARNING',
    });
  }

  // Calculate Overall Risk Category
  if (riskScore >= 75 || isVatBreached || isSsclBreached) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 50 || (!hasTIN && totalTurnover > rules.individualIncomeThreshold)) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 25 || !hasTIN) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Estimated Potential Tax Liability (Indicative)
  const estVatLiability = isVatBreached ? (totalTurnover * rules.vatRate) : 0;
  const estSsclLiability = isSsclBreached ? (totalTurnover * rules.ssclRate) : 0;
  const taxableIncome = Math.max(0, totalTurnover - rules.individualIncomeThreshold);
  const estIncomeTax = taxableIncome * rules.incomeTaxAvgRate;
  const totalEstimatedExposure = estVatLiability + estSsclLiability + estIncomeTax;

  // Primary Action Title
  let primaryAction = 'AUDIT_VERIFIED';
  if (actionRecommendations.includes('FORCED_VAT_MANDATORY') && !hasTIN) {
    primaryAction = 'FORCED_TIN_AND_VAT_REGISTRATION';
  } else if (actionRecommendations.includes('FORCED_VAT_MANDATORY')) {
    primaryAction = 'FORCED_VAT_REGISTRATION';
  } else if (actionRecommendations.includes('FORCED_TIN_MANDATORY')) {
    primaryAction = 'FORCED_TIN_REGISTRATION';
  } else if (actionRecommendations.includes('AUDIT_INVESTIGATION_REQUIRED')) {
    primaryAction = 'FIELD_INVESTIGATION_REQUIRED';
  } else if (hasTIN && totalTurnover > 0) {
    primaryAction = 'REGULAR_TAX_RETURN_MONITORING';
  }

  return {
    ...record,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    flags,
    actionRecommendations,
    primaryAction,
    isVatBreached,
    isSsclBreached,
    isIncomeTaxLiable,
    estimatedExposure: {
      vat: estVatLiability,
      sscl: estSsclLiability,
      incomeTax: estIncomeTax,
      total: totalEstimatedExposure,
    },
  };
}

/**
 * Generate aggregate statistics for Executive Dashboard
 */
export function generateAnalysisSummary(records, rules) {
  const totalRecords = records.length;
  let totalTurnoverSum = 0;
  let totalEstimatedTaxExposure = 0;
  let unregisteredCount = 0;
  let registeredCount = 0;
  let vatBreachCount = 0;
  let ssclBreachCount = 0;
  let criticalRiskCount = 0;
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let invalidNicCount = 0;

  const districtDistribution = {};
  const agencyDistribution = {};
  const actionDistribution = {};

  records.forEach((r) => {
    totalTurnoverSum += r.totalTurnover;
    totalEstimatedTaxExposure += r.estimatedExposure.total;

    if (!r.hasTIN) unregisteredCount++;
    else registeredCount++;

    if (r.isVatBreached) vatBreachCount++;
    if (r.isSsclBreached) ssclBreachCount++;

    if (r.riskLevel === 'CRITICAL') criticalRiskCount++;
    else if (r.riskLevel === 'HIGH') highRiskCount++;
    else if (r.riskLevel === 'MEDIUM') mediumRiskCount++;
    else lowRiskCount++;

    if (r.nic && !r.nicDetails.isValid) invalidNicCount++;

    // District
    const dist = r.district || 'OTHER';
    districtDistribution[dist] = (districtDistribution[dist] || 0) + 1;

    // Agency
    const agency = r.primaryAgency || 'Other';
    agencyDistribution[agency] = (agencyDistribution[agency] || 0) + 1;

    // Action
    const act = r.primaryAction || 'Other';
    actionDistribution[act] = (actionDistribution[act] || 0) + 1;
  });

  return {
    totalRecords,
    totalTurnoverSum,
    totalEstimatedTaxExposure,
    unregisteredCount,
    registeredCount,
    vatBreachCount,
    ssclBreachCount,
    criticalRiskCount,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    invalidNicCount,
    districtDistribution,
    agencyDistribution,
    actionDistribution,
  };
}
