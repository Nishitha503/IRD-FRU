/**
 * Sri Lanka District & IRD Regional Offices Mapping
 */

export const DISTRICT_REGIONAL_OFFICES = {
  'COLOMBO': {
    office: 'Metro Corporate / Colombo Regional Office',
    unit: 'Forced Reg Unit - Colombo Central',
    code: 'RO-CMB',
  },
  'GAMPAHA': {
    office: 'Gampaha Regional Office',
    unit: 'Forced Reg Unit - Western North',
    code: 'RO-GMP',
  },
  'KALUTARA': {
    office: 'Kalutara Regional Office',
    unit: 'Forced Reg Unit - Western South',
    code: 'RO-KLT',
  },
  'KANDY': {
    office: 'Kandy Regional Office',
    unit: 'Forced Reg Unit - Central Province',
    code: 'RO-KDY',
  },
  'MATALE': {
    office: 'Matale Regional Office',
    unit: 'Forced Reg Unit - Central Province',
    code: 'RO-MTL',
  },
  'NUWARA ELIYA': {
    office: 'Nuwara Eliya Regional Office',
    unit: 'Forced Reg Unit - Central Highlands',
    code: 'RO-NEL',
  },
  'GALLE': {
    office: 'Galle Regional Office',
    unit: 'Forced Reg Unit - Southern Province',
    code: 'RO-GLE',
  },
  'MATARA': {
    office: 'Matara Regional Office',
    unit: 'Forced Reg Unit - Southern Province',
    code: 'RO-MTR',
  },
  'HAMBANTOTA': {
    office: 'Hambantota Regional Office',
    unit: 'Forced Reg Unit - Ruhuna',
    code: 'RO-HMB',
  },
  'JAFFNA': {
    office: 'Jaffna Regional Office',
    unit: 'Forced Reg Unit - Northern Province',
    code: 'RO-JFN',
  },
  'KURUNEGALA': {
    office: 'Kurunegala Regional Office',
    unit: 'Forced Reg Unit - Wayamba',
    code: 'RO-KRN',
  },
  'PUTTALAM': {
    office: 'Puttalam Regional Office',
    unit: 'Forced Reg Unit - Wayamba',
    code: 'RO-PUT',
  },
  'ANURADHAPURA': {
    office: 'Anuradhapura Regional Office',
    unit: 'Forced Reg Unit - North Central',
    code: 'RO-ANP',
  },
  'POLONNARUWA': {
    office: 'Polonnaruwa Regional Office',
    unit: 'Forced Reg Unit - North Central',
    code: 'RO-POL',
  },
  'BADULLA': {
    office: 'Badulla Regional Office',
    unit: 'Forced Reg Unit - Uva Province',
    code: 'RO-BDL',
  },
  'RATNAPURA': {
    office: 'Ratnapura Regional Office',
    unit: 'Forced Reg Unit - Sabaragamuwa',
    code: 'RO-RTP',
  },
  'KEGALLE': {
    office: 'Kegalle Regional Office',
    unit: 'Forced Reg Unit - Sabaragamuwa',
    code: 'RO-KGL',
  },
  'BATTICALOA': {
    office: 'Batticaloa Regional Office',
    unit: 'Forced Reg Unit - Eastern Province',
    code: 'RO-BTC',
  },
  'TRINCOMALEE': {
    office: 'Trincomalee Regional Office',
    unit: 'Forced Reg Unit - Eastern Province',
    code: 'RO-TRN',
  },
  'AMPARA': {
    office: 'Ampara Regional Office',
    unit: 'Forced Reg Unit - Eastern Province',
    code: 'RO-AMP',
  },
};

export function detectDistrictFromAddress(address = '') {
  if (!address) return { district: 'COLOMBO', ...DISTRICT_REGIONAL_OFFICES['COLOMBO'] };

  const upper = String(address).toUpperCase();
  for (const [district, info] of Object.entries(DISTRICT_REGIONAL_OFFICES)) {
    if (upper.includes(district)) {
      return { district, ...info };
    }
  }

  // Keyword heuristics for common Sri Lankan cities
  const cityMap = {
    'MAHARAGAMA': 'COLOMBO',
    'NUGEGODA': 'COLOMBO',
    'DEHIWALA': 'COLOMBO',
    'MOUNT LAVINIA': 'COLOMBO',
    'RAJAGIRIYA': 'COLOMBO',
    'KOTTE': 'COLOMBO',
    'BATTARAMULLA': 'COLOMBO',
    'KOLONNAWA': 'COLOMBO',
    'HOMAGAMA': 'COLOMBO',
    'KADUWELA': 'COLOMBO',
    'NEGOMBO': 'GAMPAHA',
    'KELANIYA': 'GAMPAHA',
    'KIRIBATHGODA': 'GAMPAHA',
    'JA-ELA': 'GAMPAHA',
    'WATTALA': 'GAMPAHA',
    'KADAWATHA': 'GAMPAHA',
    'PANADURA': 'KALUTARA',
    'HORANA': 'KALUTARA',
    'BERUWALA': 'KALUTARA',
    'PERADENIYA': 'KANDY',
    'KATUGASTOTA': 'KANDY',
    'HIKKADUWA': 'GALLE',
    'KARAPITIYA': 'GALLE',
  };

  for (const [city, dist] of Object.entries(cityMap)) {
    if (upper.includes(city)) {
      return { district: dist, ...DISTRICT_REGIONAL_OFFICES[dist] };
    }
  }

  return { district: 'HEAD OFFICE / UNASSIGNED', office: 'Head Office - Forced Registration Branch, Sir Chittampalam A. Gardiner Mawatha, Colombo 02', unit: 'Central FRU', code: 'HQ-FRU' };
}
