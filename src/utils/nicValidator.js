/**
 * Sri Lankan National Identity Card (NIC) Validator & Parser
 * Supports both Old Format (9 digits + V/X) and New Format (12 digits)
 */

const DAYS_IN_MONTHS_NON_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Sri Lankan NIC uses 366-day base table

export function parseSriLankanNIC(nicInput) {
  if (!nicInput) {
    return {
      isValid: false,
      nic: '',
      format: 'UNKNOWN',
      error: 'NIC number is missing',
      dob: null,
      gender: null,
      age: null,
      dayOfYear: null,
      standardizedNic: '',
    };
  }

  const cleanNic = String(nicInput).trim().toUpperCase();

  // Pattern 1: Old NIC - 9 digits followed by V or X (e.g., 852401234V)
  const oldNicRegex = /^([0-9]{2})([0-9]{3})([0-9]{3})([VX])$/;

  // Pattern 2: New NIC - 12 digits (e.g., 198524001234)
  const newNicRegex = /^([0-9]{4})([0-9]{3})([0-9]{5})$/;

  const currentYear = new Date().getFullYear();

  if (oldNicRegex.test(cleanNic)) {
    const match = cleanNic.match(oldNicRegex);
    const yearShort = parseInt(match[1], 10);
    const fullYear = 1900 + yearShort;
    let dayOfYear = parseInt(match[2], 10);
    let gender = 'Male';

    if (dayOfYear > 500) {
      gender = 'Female';
      dayOfYear -= 500;
    }

    if (dayOfYear < 1 || dayOfYear > 366) {
      return {
        isValid: false,
        nic: cleanNic,
        format: 'OLD_9_DIGIT',
        error: `Invalid day of year: ${dayOfYear}`,
        dob: null,
        gender,
        age: null,
        dayOfYear,
        standardizedNic: cleanNic,
      };
    }

    const { month, day } = getMonthAndDay(dayOfYear);
    const dob = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const age = currentYear - fullYear;

    return {
      isValid: true,
      nic: cleanNic,
      format: 'OLD_9_DIGIT',
      year: fullYear,
      dob,
      gender,
      age,
      dayOfYear,
      standardizedNic: cleanNic,
      canConvertToNew: `19${match[1]}${match[2]}0${match[3]}`,
    };
  } else if (newNicRegex.test(cleanNic)) {
    const match = cleanNic.match(newNicRegex);
    const fullYear = parseInt(match[1], 10);
    let dayOfYear = parseInt(match[2], 10);
    let gender = 'Male';

    if (fullYear < 1900 || fullYear > currentYear) {
      return {
        isValid: false,
        nic: cleanNic,
        format: 'NEW_12_DIGIT',
        error: `Invalid birth year: ${fullYear}`,
        dob: null,
        gender: null,
        age: null,
        dayOfYear: null,
        standardizedNic: cleanNic,
      };
    }

    if (dayOfYear > 500) {
      gender = 'Female';
      dayOfYear -= 500;
    }

    if (dayOfYear < 1 || dayOfYear > 366) {
      return {
        isValid: false,
        nic: cleanNic,
        format: 'NEW_12_DIGIT',
        error: `Invalid day of year: ${dayOfYear}`,
        dob: null,
        gender,
        age: null,
        dayOfYear,
        standardizedNic: cleanNic,
      };
    }

    const { month, day } = getMonthAndDay(dayOfYear);
    const dob = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const age = currentYear - fullYear;

    return {
      isValid: true,
      nic: cleanNic,
      format: 'NEW_12_DIGIT',
      year: fullYear,
      dob,
      gender,
      age,
      dayOfYear,
      standardizedNic: cleanNic,
    };
  }

  return {
    isValid: false,
    nic: cleanNic,
    format: 'INVALID',
    error: 'Does not match 9-digit (with V/X) or 12-digit format',
    dob: null,
    gender: null,
    age: null,
    dayOfYear: null,
    standardizedNic: cleanNic,
  };
}

function getMonthAndDay(dayOfYear) {
  let days = dayOfYear;
  for (let m = 0; m < DAYS_IN_MONTHS_NON_LEAP.length; m++) {
    const monthDays = DAYS_IN_MONTHS_NON_LEAP[m];
    if (days <= monthDays) {
      return { month: m + 1, day: days };
    }
    days -= monthDays;
  }
  return { month: 12, day: 31 };
}
