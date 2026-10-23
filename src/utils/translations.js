/**
 * Trilingual Translation Dictionary for IRD Forced Registration Unit (FRU) Master System
 * Languages: English (en) | Sinhala (si) | Tamil (ta)
 */

export const TRANSLATIONS = {
  en: {
    // Government Top Bar
    govTitle: 'Government of Sri Lanka',
    govTrilingual: 'Government of Sri Lanka • Democratic Socialist Republic',
    hotlineLabel: 'Hotline: 1944',
    portalLink: 'ird.gov.lk',
    ramisLink: 'RAMIS e-Services',
    timeZone: 'Sri Lanka Standard Time (SLST)',

    // Header & Brand
    deptTitle: 'DEPARTMENT OF INLAND REVENUE',
    deptSubtitle: 'Sri Lanka',
    fruTitle: 'FORCED REGISTRATION UNIT (FRU)',
    fruSubtitle: 'Statutory Taxpayer Intelligence & Compliance System',
    fruUnitBadge: 'Forced Registration Unit',
    actReference: 'Inland Revenue Act No. 24 of 2017',
    taxRulesBtn: 'Tax Rules',
    tinHistoryBtn: 'TIN 6-Month History',
    lockExitBtn: 'Lock / Exit',
    officerDefault: 'Officer',
    switchProfile: 'Switch Profile',

    // Welcome Gateway Screen (Intro UI before login)
    welcomeTagline: 'Official Taxpayer Compliance & Statutory Enforcement Gateway',
    welcomeSubtitle: 'Authorized Government System for Forced Registration Unit (FRU) Assessors and Commissioners',
    welcomeEnterBtn: 'Access Officer Login Portal →',
    welcomeFeature1: '100% Confidential & Offline-Secure',
    welcomeFeature2: 'Automated NIC / BRN Normalizer',
    welcomeFeature3: 'Statutory Cross-Verification under Section 102',
    backToHome: '← Back to Portal Home',

    // Official Notice Marquee
    marqueeText: '🔴 OFFICIAL NOTICE: Mandatory Taxpayer Registration under Inland Revenue Act No. 24 of 2017 & Gazette Extra. No. 2334/21 — Forced Registration Compliance Active • IRD Hotline: 1944',

    // Step Indicator
    step1Title: '1. Import Data',
    step1Desc: 'Upload FRU Taxpayer File',
    step2Title: '2. Column Mapping',
    step2Desc: 'Match Fields to System',
    step3Title: '3. FRU Analysis',
    step3Desc: 'Risk Scoring & Master Grid',
    step4Title: '4. Notices & Export',
    step4Desc: 'Generate Notices & Reports',

    // File Upload (Dedicated FRU Data Ingestion)
    uploadHeader: 'Upload FRU Taxpayer Investigation Files (Batch Upload)',
    uploadSubheader: 'Drag and drop one or multiple Excel (.xlsx, .xls) or CSV files here, or click to browse.',
    supportedFormats: 'Supports Multiple .xlsx, .xls, .csv',
    uploadButtonText: 'Browse Files (Multi-Select)',
    addMoreFiles: '+ Add More Files',
    filesUploadedBadge: 'Files Ingested',
    mergedNotice: 'All files consolidated into a single unified dataset with auto-tagging',
    fruDirectivesTitle: 'Forced Registration Unit (FRU) Upload Guidelines',
    fruGuideline1: 'Upload files containing suspected unregistered persons or businesses exceeding statutory turnover thresholds.',
    fruGuideline2: 'Recommended columns: National Identity Card (NIC), Business Registration (BRN), Taxpayer Name, Turnover/Transaction Value, Address, and Phone Number.',
    fruGuideline3: '100% Secure & Client-Side: Sensitive taxpayer data remains strictly on your local terminal and is never transmitted over the internet.',
    fileSelected: 'Selected File',
    sheetSelectLabel: 'Select Excel Sheet:',
    totalRows: 'Rows Detected',
    columnsFound: 'Columns Found',
    proceedToMapping: 'Proceed to Column Mapping →',
    chooseAnotherFile: 'Choose Another File',

    // Column Mapping
    mappingTitle: 'Align Dataset Fields with IRD Standard Master Columns',
    mappingSubtitle: 'Map your uploaded spreadsheet headers to IRD Forced Registration verification attributes.',
    analyzingBtn: 'Execute FRU Intelligence & Analysis →',
    backBtn: '← Back to Upload',
    fieldNIC: 'National Identity Card (NIC)',
    fieldBRN: 'Business Registration No (BRN)',
    fieldTIN: 'Existing Taxpayer ID (TIN)',
    fieldName: 'Taxpayer / Entity Name',
    fieldAddress: 'Registered / Residential Address',
    fieldPhone: 'Contact Phone Number',
    fieldEmail: 'Email Address',
    fieldTurnover: 'Annual Turnover / Transaction Value (LKR)',
    fieldAgency: 'Source Agency / Institution',
    fieldTxDate: 'Transaction / Record Date',
    fieldCategory: 'Industry / Business Category',
    fieldDescription: 'Transaction Description / Notes',

    // Master Grid & Analytics
    analyticsTitle: 'FRU Compliance Intelligence Dashboard',
    totalAnalyzed: 'Total Records Analyzed',
    highRiskCases: 'Forced Registration Mandated',
    vatExceeded: 'VAT Threshold Exceeded',
    missingTIN: 'Unregistered (No TIN)',
    exportExcel: 'Export Master Register (Excel)',
    exportPDF: 'Generate Statutory Notices (PDF)',

    // Auth Gateway
    authGovHeader: 'Democratic Socialist Republic of Sri Lanka',
    authDeptTag: 'DEPARTMENT OF INLAND REVENUE • SRI LANKA',
    authMainTitle: 'FORCED REGISTRATION UNIT (FRU)',
    authSubTitle: 'Master Taxpayer Intelligence & Enforcement Management System',
    authLegalTag: 'Under Section 102 of Inland Revenue Act No. 24 of 2017',
    authSignInTab: 'Officer Sign-In',
    authRegisterTab: 'Register Officer',
    authIdentifierLabel: 'Username / Service ID / Official Email',
    authIdentifierPlaceholder: 'e.g. IRD-EMP-4421, bandara, or officer email',
    authPasswordLabel: 'Account Password',
    authPasswordPlaceholder: 'Enter your password',
    authSignInBtn: 'Sign In & Access FRU System',
    authAuthenticating: 'Authenticating...',
    authSecurityNotice: 'Authorized Government Personnel Only • Section 102 Inland Revenue Act No. 24 of 2017',
    dbStatusCloud: 'Google Firebase Cloud Database Active',
    dbStatusOffline: 'Local Offline Database (Firebase ready in .env)',
    dbConfigGuideBtn: 'Cloud DB Setup Guide',

    // Footer
    footerAddress: 'Forced Registration Unit (FRU) • Sir Chittampalam A. Gardiner Mawatha, Colombo 02, Sri Lanka.',
    footerLegal: 'Statutory Operations under Inland Revenue Act No. 24 of 2017 & Value Added Tax Act No. 14 of 2002.',
  },

  si: {
    // Government Top Bar
    govTitle: 'ශ්‍රී ලංකා රජය',
    govTrilingual: 'ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය',
    hotlineLabel: 'ක්ෂණික ඇමතුම්: 1944',
    portalLink: 'ird.gov.lk',
    ramisLink: 'RAMIS විද්‍යුත් සේවා',
    timeZone: 'ශ්‍රී ලංකා සම්මත වේලාව (SLST)',

    // Header & Brand
    deptTitle: 'දේශීය ආදායම් දෙපාර්තමේන්තුව',
    deptSubtitle: 'ශ්‍රී ලංකාව',
    fruTitle: 'බලයලත් ලියාපදිංචි කිරීමේ ඒකකය (FRU)',
    fruSubtitle: 'බදු අනුකූලතා හා නීතිමය බලාත්මක කිරීමේ කළමනාකරණ පද්ධතිය',
    fruUnitBadge: 'බලයලත් ලියාපදිංචි කිරීමේ ඒකකය',
    actReference: '2017 අංක 24 දරන දේශීය ආදායම් පනත',
    taxRulesBtn: 'බදු නීති',
    tinHistoryBtn: 'TIN 6-මස දත්ත විමර්ශනය',
    lockExitBtn: 'අගුළුලන්න / පිටවීම',
    officerDefault: 'නිලධාරී',
    switchProfile: 'පැතිකඩ මාරු කරන්න',

    // Welcome Gateway Screen (Intro UI before login)
    welcomeTagline: 'නිල බදු අනුකූලතා හා නීතිමය බලාත්මක කිරීමේ ද්වාරය',
    welcomeSubtitle: 'බලයලත් ලියාපදිංචි කිරීමේ ඒකකයේ (FRU) තක්සේරුකරුවන් සහ කොමසාරිස්වරුන් සඳහා වූ නිල පද්ධතිය',
    welcomeEnterBtn: 'නිලධාරී පිවිසුම වෙත යන්න →',
    welcomeFeature1: '100% රහස්‍ය සහ නොබැඳි ආරක්ෂාව (Offline-Secure)',
    welcomeFeature2: 'ස්වයංක්‍රීය NIC / BRN හඳුනාගැනීම',
    welcomeFeature3: '102 වන වගන්තිය යටතේ නීතිමය පරීක්ෂාව',
    backToHome: '← මුල් පිටුවට',

    // Official Notice Marquee
    marqueeText: '🔴 නිල නිවේදනය: 2017 අංක 24 දරන දේශීය ආදායම් පනත සහ අංක 2334/21 දරන අතිවිශේෂ ගැසට් පත්‍රය යටතේ අනිවාර්ය TIN ලියාපදිංචිය ක්‍රියාත්මකයි • IRD ක්ෂණික ඇමතුම්: 1944',

    // Step Indicator
    step1Title: '1. දත්ත ඇතුලත් කිරීම',
    step1Desc: 'FRU ගොනුව ඇතුලත් කරන්න',
    step2Title: '2. තීරු ගැලපීම',
    step2Desc: 'පද්ධති ක්ෂේත්‍ර ගලපන්න',
    step3Title: '3. FRU විශ්ලේෂණය',
    step3Desc: 'අවදානම් ලකුණු කිරීම හා Master ලේඛනය',
    step4Title: '4. නිවේදන හා වාර්තා',
    step4Desc: 'නීතිමය නිවේදන බාගත කිරීම',

    // File Upload (Dedicated FRU Data Ingestion)
    uploadHeader: 'FRU බදු විමර්ශන Excel ගොනු එකක් හෝ කිහිපයක් ඇතුළත් කරන්න (Batch Upload)',
    uploadSubheader: 'Excel (.xlsx, .xls) හෝ CSV ගොනු එකක් හෝ කිහිපයක් එකවර මෙතැනට Drag & Drop කරන්න, නැතහොත් තෝරන්න.',
    supportedFormats: 'ගොනු කිහිපයක් (.xlsx, .xls, .csv) සඳහා සහය දක්වයි',
    uploadButtonText: 'ගොනු තෝරන්න (Select Files)',
    addMoreFiles: '+ තවත් Files එකතු කරන්න',
    filesUploadedBadge: 'ගොනු එකතු කර ඇත',
    mergedNotice: 'සියලුම ගොනුවල දත්ත ස්වයංක්‍රීයව එකතු කර (Consolidated) සකසා ඇත',
    fruDirectivesTitle: 'බලයලත් ලියාපදිංචි කිරීමේ ඒකකයේ (FRU) දත්ත ඇතුලත් කිරීමේ උපදෙස්',
    fruGuideline1: 'නියමිත බදු සීමාව ඉක්මවූ හෝ මෙතෙක් ලියාපදිංචි නොවූ පුද්ගලයින් සහ ව්‍යාපාර ඇතුළත් දත්ත ගොනුව මෙහි ඇතුලත් කරන්න.',
    fruGuideline2: 'අවශ්‍ය ප්‍රධාන තොරතුරු: ජාතික හැඳුනුම්පත් අංකය (NIC), ව්‍යාපාර ලියාපදිංචි අංකය (BRN), නම, වාර්ෂික පිරිවැටුම, ලිපිනය සහ දුරකථන අංකය.',
    fruGuideline3: '100% රහස්‍ය සහ ආරක්ෂිතයි: බදු ගෙවන්නන්ගේ දත්ත මෙම පරිගණකයෙන් බැහැරට නොයන අතර අන්තර්ජාලයට උඩුගත නොවේ.',
    fileSelected: 'තෝරාගත් ගොනුව',
    sheetSelectLabel: 'Excel Sheet එක තෝරන්න:',
    totalRows: 'හඳුනාගත් පේළි ගණන',
    columnsFound: 'හඳුනාගත් තීරු',
    proceedToMapping: 'තීරු ගැලපීමට පිවිසෙන්න →',
    chooseAnotherFile: 'වෙනත් ගොනුවක් තෝරන්න',

    // Column Mapping
    mappingTitle: 'දත්ත ගොනුවේ තීරු IRD සම්මත ක්ෂේත්‍ර සමඟ ගලපන්න',
    mappingSubtitle: 'ඔබ ඇතුලත් කළ Excel තීරු, බලයලත් ලියාපදිංචි කිරීමේ පද්ධතියේ ප්‍රමිතීන්ට අනුව ගලපන්න.',
    analyzingBtn: 'FRU බදු විශ්ලේෂණය ක්‍රියාත්මක කරන්න →',
    backBtn: '← නැවත ගොනු පිටුවට',
    fieldNIC: 'ජාතික හැඳුනුම්පත් අංකය (NIC)',
    fieldBRN: 'ව්‍යාපාර ලියාපදිංචි අංකය (BRN)',
    fieldTIN: 'පවතින TIN අංකය',
    fieldName: 'බදු ගෙවන්නාගේ / ව්‍යාපාරයේ නම',
    fieldAddress: 'ලිපිනය',
    fieldPhone: 'දුරකථන අංකය',
    fieldEmail: 'විද්‍යුත් තැපැල් ලිපිනය (Email)',
    fieldTurnover: 'වාර්ෂික පිරිවැටුම / ගනුදෙනු වටිනාකම (රු.)',
    fieldAgency: 'දත්ත මූලාශ්‍ර ආයතනය',
    fieldTxDate: 'ගනුදෙනු දිනය',
    fieldCategory: 'ව්‍යාපාර ක්ෂේත්‍රය',
    fieldDescription: 'ගනුදෙනු විස්තරය',

    // Master Grid & Analytics
    analyticsTitle: 'FRU අනුකූලතා හා බදු බුද්ධි පුවරුව',
    totalAnalyzed: 'විශ්ලේෂණය කළ මුළු වාර්තා',
    highRiskCases: 'බලයලත් ලියාපදිංචිය අනිවාර්ය අය',
    vatExceeded: 'VAT සීමාව ඉක්මවූවන්',
    missingTIN: 'TIN අංක නොමැති අය',
    exportExcel: 'Master ලේඛනය බාගත කරන්න (Excel)',
    exportPDF: 'නීතිමය නිවේදන සකසන්න (PDF)',

    // Auth Gateway
    authGovHeader: 'ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය',
    authDeptTag: 'දේශීය ආදායම් දෙපාර්තමේන්තුව • ශ්‍රී ලංකාව',
    authMainTitle: 'බලයලත් ලියාපදිංචි කිරීමේ ඒකකය (FRU)',
    authSubTitle: 'බදු බුද්ධි හා බලාත්මක කිරීමේ මාස්ටර් කළමනාකරණ පද්ධතිය',
    authLegalTag: '2017 අංක 24 දරන දේශීය ආදායම් පනතේ 102 වන වගන්තිය යටතේ',
    authSignInTab: 'නිලධාරී පිවිසුම',
    authRegisterTab: 'නව නිලධාරී ලියාපදිංචිය',
    authIdentifierLabel: 'පරිශීලක නාමය / සේවා අංකය / නිල විද්‍යුත් තැපෑල',
    authIdentifierPlaceholder: 'උදා: IRD-EMP-4421, bandara, හෝ නිල email ලිපිනය',
    authPasswordLabel: 'මුරපදය (Password)',
    authPasswordPlaceholder: 'ඔබගේ මුරපදය ඇතුලත් කරන්න',
    authSignInBtn: 'FRU පද්ධතියට පිවිසෙන්න',
    authAuthenticating: 'තහවුරු කරමින් පවතී...',
    authSecurityNotice: 'බලයලත් රාජ්‍ය නිලධාරීන්ට පමණි • 2017 අංක 24 දරන දේශීය ආදායම් පනතේ 102 වන වගන්තිය',
    dbStatusCloud: 'Google Firebase Cloud Database සක්‍රීයයි',
    dbStatusOffline: 'නොබැඳි ආරක්ෂිත Database (.env මඟින් Firebase සම්බන්ධ කළ හැක)',
    dbConfigGuideBtn: 'Database සැකසුම් උපදෙස්',

    // Footer
    footerAddress: 'බලයලත් ලියාපදිංචි කිරීමේ ඒකකය (FRU) • ශ්‍රීමත් චිත්තම්පලම් ඒ. ගාඩිනර් මාවත, කොළඹ 02, ශ්‍රී ලංකාව.',
    footerLegal: '2017 අංක 24 දරන දේශීය ආදායම් පනත සහ 2002 අංක 14 දරන එකතු කළ අගය මත බදු පනත යටතේ ක්‍රියාත්මකයි.',
  },

  ta: {
    // Government Top Bar
    govTitle: 'இலங்கை அரசாங்கம்',
    govTrilingual: 'இலங்கை சனநாயக சோசலிசக் குடியரசு',
    hotlineLabel: 'அவசர அழைப்பு: 1944',
    portalLink: 'ird.gov.lk',
    ramisLink: 'RAMIS மின்-சேவைகள்',
    timeZone: 'இலங்கை நிலையான நேரம் (SLST)',

    // Header & Brand
    deptTitle: 'உள்நாட்டு இறைவரித் திணைக்களம்',
    deptSubtitle: 'இலங்கை',
    fruTitle: 'கட்டாயப் பதிவுப் பிரிவு (FRU)',
    fruSubtitle: 'வரி செலுத்துவோர் இணக்கம் மற்றும் சட்ட அமலாக்க அமைப்பு',
    fruUnitBadge: 'கட்டாயப் பதிவுப் பிரிவு',
    actReference: '2017 ஆம் ஆண்டின் 24 ஆம் இலக்க உள்நாட்டு இறைவரிச் சட்டம்',
    taxRulesBtn: 'வரி விதிகள்',
    tinHistoryBtn: 'TIN 6-மாத வரலாறு',
    lockExitBtn: 'பூட்டு / வெளியேறு',
    officerDefault: 'அதிகாரி',
    switchProfile: 'சுயவிவரத்தை மாற்றவும்',

    // Welcome Gateway Screen (Intro UI before login)
    welcomeTagline: 'உத்தியோகபூர்வ வரி இணக்கம் மற்றும் சட்ட அமலாக்க நுழைவாயில்',
    welcomeSubtitle: 'கட்டாயப் பதிவுப் பிரிவு (FRU) மதிப்பீட்டாளர்கள் மற்றும் ஆணையாளர்களுக்கான அங்கீகரிக்கப்பட்ட அமைப்பு',
    welcomeEnterBtn: 'அதிகாரி உள்நுழைவு போர்ட்டலை அணுகவும் →',
    welcomeFeature1: '100% ரகசிய மற்றும் ஆஃப்லைன் பாதுகாப்பு',
    welcomeFeature2: 'தானியங்கி NIC / BRN சீராக்கம்',
    welcomeFeature3: 'பிரிவு 102 இன் கீழ் சட்டரீதியான சரிபார்ப்பு',
    backToHome: '← முகப்புக்குத் திரும்புக',

    // Official Notice Marquee
    marqueeText: '🔴 உத்தியோகபூர்வ அறிவிப்பு: 2017 ஆம் ஆண்டின் 24 ஆம் இலக்க உள்நாட்டு இறைவரிச் சட்டம் & அதிவிசேட வர்த்தமானி 2334/21 இன் கீழ் கட்டாய TIN பதிவு அமுலில் உள்ளது • IRD தொலைபேசி: 1944',

    // Step Indicator
    step1Title: '1. தரவு உள்ளீடு',
    step1Desc: 'FRU கோப்பைப் பதிவேற்றவும்',
    step2Title: '2. நிரல் பொருத்தம்',
    step2Desc: 'களங்களை பொருத்தவும்',
    step3Title: '3. FRU பகுப்பாய்வு',
    step3Desc: 'ஆபத்து மதிப்பீடு & முதன்மைப் பதிவேடு',
    step4Title: '4. அறிவிப்புகள் & ஏற்றுமதி',
    step4Desc: 'சட்டப்பூர்வ அறிவிப்புகள் & அறிக்கைகள்',

    // File Upload (Dedicated FRU Data Ingestion)
    uploadHeader: 'FRU வரி விசாரணை கோப்புகளை பதிவேற்றவும் (தொகுதி பதிவேற்றம்)',
    uploadSubheader: 'ஒன்று அல்லது பல Excel (.xlsx, .xls) அல்லது CSV கோப்புகளை இங்கே இழுத்துப் போடவும் அல்லது தேர்ந்தெடுக்கவும்.',
    supportedFormats: 'பல கோப்புகள் (.xlsx, .xls, .csv) ஆதரிக்கப்படும்',
    uploadButtonText: 'கோப்புகளைத் தேர்ந்தெடுக்கவும்',
    addMoreFiles: '+ மேலும் கோப்புகளைச் சேர்க்கவும்',
    filesUploadedBadge: 'கோப்புகள் பதிவேற்றப்பட்டன',
    mergedNotice: 'அனைத்து கோப்புகளின் தரவுகளும் தானாகவே ஒருங்கிணைக்கப்பட்டுள்ளன',
    fruDirectivesTitle: 'கட்டாயப் பதிவுப் பிரிவு (FRU) தரவுப் பதிவேற்ற வழிகாட்டல்',
    fruGuideline1: 'சட்டரீதியான வருமான வரம்பைத் தாண்டிய பதிவு செய்யப்படாத நபர்கள் அல்லது நிறுவனங்களின் தரவை இங்கே பதிவேற்றவும்.',
    fruGuideline2: 'தேவையான தகவல்கள்: தேசிய அடையாள அட்டை (NIC), வணிகப் பதிவு (BRN), வரி செலுத்துவோர் பெயர், விற்றுமுதல், முகவரி, தொலைபேசி எண்.',
    fruGuideline3: '100% பாதுகாப்பானது: வரி செலுத்துவோர் தரவு உங்கள் கணினியில் மட்டுமே பாதுகாப்பாக இருக்கும், இணையத்தில் பதிவேற்றப்படாது.',
    fileSelected: 'தேர்ந்தெடுக்கப்பட்ட கோப்பு',
    sheetSelectLabel: 'Excel தாளைத் தேர்ந்தெடுக்கவும்:',
    totalRows: 'கண்டறியப்பட்ட வரிசைகள்',
    columnsFound: 'கண்டறியப்பட்ட நிரல்கள்',
    proceedToMapping: 'நிரல் பொருத்தத்திற்குச் செல்லவும் →',
    chooseAnotherFile: 'வேறு கோப்பைத் தேர்ந்தெடுக்கவும்',

    // Column Mapping
    mappingTitle: 'தரவுக் கோப்பு நிரல்களை IRD நிலையான புலங்களுடன் பொருத்தவும்',
    mappingSubtitle: 'பதிவேற்றிய தலைப்புகளை IRD கட்டாயப் பதிவு சரிபார்ப்புக் கூறுகளுடன் இணைக்கவும்.',
    analyzingBtn: 'FRU வரி பகுப்பாய்வை இயக்கவும் →',
    backBtn: '← பதிவேற்றத்திற்குத் திரும்புக',
    fieldNIC: 'தேசிய அடையாள அட்டை எண் (NIC)',
    fieldBRN: 'வணிகப் பதிவு எண் (BRN)',
    fieldTIN: 'தற்போதுள்ள TIN எண்',
    fieldName: 'வரி செலுத்துவோர் / நிறுவனத்தின் பெயர்',
    fieldAddress: 'முகவரி',
    fieldPhone: 'தொலைபேசி எண்',
    fieldEmail: 'மின்னஞ்சல் முகவரி',
    fieldTurnover: 'வருடாந்த விற்றுமுதல் / கொடுக்கல் வாங்கல் பெறுமதி (ரூ.)',
    fieldAgency: 'மூல நிறுவனம்',
    fieldTxDate: 'கொடுக்கல் வாங்கல் திகதி',
    fieldCategory: 'தொழில் / வணிகப் பிரிவு',
    fieldDescription: 'விவரம் / குறிப்புகள்',

    // Master Grid & Analytics
    analyticsTitle: 'FRU இணக்கப் புலனாய்வு டாஷ்போர்டு',
    totalAnalyzed: 'பகுப்பாய்வு செய்யப்பட்ட மொத்த பதிவுகள்',
    highRiskCases: 'கட்டாயப் பதிவு தேவைப்படுபவர்கள்',
    vatExceeded: 'VAT வரம்பை மீறியவர்கள்',
    missingTIN: 'TIN இல்லாத பதிவு செய்யப்படாதவர்கள்',
    exportExcel: 'முதன்மைப் பதிவேட்டை ஏற்றுமதி செய்க (Excel)',
    exportPDF: 'சட்டப்பூர்வ அறிவிப்புகளை உருவாக்குக (PDF)',

    // Auth Gateway
    authGovHeader: 'இலங்கை சனநாயக சோசலிசக் குடியரசு',
    authDeptTag: 'உள்நாட்டு இறைவரித் திணைக்களம் • இலங்கை',
    authMainTitle: 'கட்டாயப் பதிவுப் பிரிவு (FRU)',
    authSubTitle: 'வரி செலுத்துவோர் நுண்ணறிவு மற்றும் சட்ட அமலாக்க மேலாண்மை அமைப்பு',
    authLegalTag: '2017 ஆம் ஆண்டின் 24 ஆம் இலக்க உள்நாட்டு இறைவரிச் சட்டத்தின் 102 ஆம் பிரிவின் கீழ்',
    authSignInTab: 'அதிகாரி உள்நுழைவு',
    authRegisterTab: 'புதிய அதிகாரி பதிவு',
    authIdentifierLabel: 'பயனர் பெயர் / சேவை ஐடி / உத்தியோகபூர்வ மின்னஞ்சல்',
    authIdentifierPlaceholder: 'உதாரணம்: IRD-EMP-4421, bandara, அல்லது மின்னஞ்சல்',
    authPasswordLabel: 'கடவுச்சொல்',
    authPasswordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    authSignInBtn: 'FRU கணினியில் உள்நுழையவும்',
    authAuthenticating: 'சரிபார்க்கிறது...',
    authSecurityNotice: 'அங்கீகரிக்கப்பட்ட அரசாங்க பணியாளர்களுக்கு மட்டும் • பிரிவு 102',
    dbStatusCloud: 'Google Firebase கிளவுட் தரவுத்தளம் செயலில் உள்ளது',
    dbStatusOffline: 'ஆஃப்லைன் பாதுகாப்பான தரவுத்தளம் (.env இல் Firebase தயாராக உள்ளது)',
    dbConfigGuideBtn: 'தரவுத்தள வழிகாட்டி',

    // Footer
    footerAddress: 'கட்டாயப் பிரிவுப் பிரிவு (FRU) • சேர் சிற்றம்பலம் ஏ. கார்டினர் மாவத்தை, கொழும்பு 02, இலங்கை.',
    footerLegal: '2017 ஆம் ஆண்டின் 24 ஆம் இலக்க உள்நாட்டு இறைவரிச் சட்டம் மற்றும் 2002 ஆம் ஆண்டின் 14 ஆம் இலக்க பெறுமதி சேர்க்கப்பட்ட வரிச் சட்டத்தின் கீழ் இயங்குகிறது.',
  },
};

/**
 * Helper to get translation by key for a specific language
 */
export function getTranslation(lang = 'en') {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
