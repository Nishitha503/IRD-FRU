/**
 * Sri Lankan TIN (Taxpayer Identification Number) and BRN Validator
 */

export function parseSriLankanTIN(tinInput) {
  if (!tinInput) {
    return {
      isValid: false,
      tin: '',
      status: 'MISSING',
      error: 'TIN is missing or empty',
    };
  }

  const cleanTin = String(tinInput).replace(/[^0-9]/g, '').trim();

  // Sri Lanka TINs are typically 9 digits (standard) or 10 digits
  if (cleanTin.length === 9 || cleanTin.length === 10) {
    return {
      isValid: true,
      tin: cleanTin,
      status: 'VALID_FORMAT',
      length: cleanTin.length,
    };
  }

  return {
    isValid: false,
    tin: String(tinInput).trim(),
    status: 'INVALID_FORMAT',
    error: `TIN must be 9 or 10 digits (Found ${cleanTin.length})`,
  };
}

export function parseSriLankanBRN(brnInput) {
  if (!brnInput) {
    return {
      isValid: false,
      brn: '',
      type: 'UNKNOWN',
    };
  }

  const clean = String(brnInput).trim().toUpperCase();

  // Examples: PV 12345, PB 9876, GA 1122, W/12345, CP/KD/1234
  if (/^(PV|PB|GA|WC|SP|CP|WP|NP|EP|NW|NC|SG|UVA)[\s\/\-]?[0-9]+/i.test(clean) || /^[A-Z0-9\/\-]{4,20}$/.test(clean)) {
    return {
      isValid: true,
      brn: clean,
      type: clean.startsWith('PV') ? 'Private Limited Company' :
            clean.startsWith('PB') ? 'Public Limited Company' :
            clean.startsWith('GA') ? 'Guarantee Company' : 'Business Registration',
    };
  }

  return {
    isValid: clean.length >= 3,
    brn: clean,
    type: 'Sole Proprietorship / General Reg',
  };
}
