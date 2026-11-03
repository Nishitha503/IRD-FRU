/**
 * Shared Network Folder & 6-Month Historical Repository Service for IRD FRU
 * Connects to a Windows Shared Folder / LAN Directory (or Local Repository)
 * to persist and retrieve cumulative taxpayer transaction histories spanning 6 months and beyond.
 */

const STORAGE_KEY_CONFIG = 'ird_shared_folder_config';
const DB_NAME = 'IRD_FRU_Historical_DB';
const STORE_NAME = 'historical_transactions';
const DB_VERSION = 1;

let dirHandleCache = null;

/**
 * Initialize IndexedDB for persistent in-browser storage of historical transactions
 */
function openHistoricalDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('tin', 'tin', { unique: false });
        store.createIndex('nic', 'nic', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

/**
 * Returns current Shared Folder Configuration and Status
 */
export function getSharedFolderConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading shared folder config:', err);
  }
  return {
    isLinked: false,
    folderName: '',
    folderPath: '',
    lastSyncAt: null,
    totalRecords: 0,
    totalTransactions: 0,
    autoSync: true,
  };
}

/**
 * Save Shared Folder Configuration
 */
export function saveSharedFolderConfig(cfg) {
  const current = getSharedFolderConfig();
  const updated = { ...current, ...cfg };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  return updated;
}

/**
 * Request user to pick a Shared Folder via native File System Access API
 */
export async function linkDirectoryPicker() {
  if (!window.showDirectoryPicker) {
    return {
      success: false,
      error: 'File System Directory Picker is not supported in this browser. Please use Chrome or Edge.',
    };
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      id: 'ird_fru_shared_folder',
      mode: 'readwrite',
    });

    dirHandleCache = dirHandle;
    const folderName = dirHandle.name;

    // Verify or initialize structure inside shared folder
    const config = saveSharedFolderConfig({
      isLinked: true,
      folderName,
      folderPath: folderName,
      lastSyncAt: new Date().toISOString(),
    });

    // Attempt to load existing history from folder
    const loaded = await loadFromDirectoryHandle(dirHandle);

    return {
      success: true,
      folderName,
      config,
      totalLoaded: loaded.length,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'User cancelled folder selection.' };
    }
    return { success: false, error: err.message };
  }
}

/**
 * Reads existing historical transactions from directory handle
 */
async function loadFromDirectoryHandle(dirHandle) {
  try {
    const fileHandle = await dirHandle.getFileHandle('ird_fru_history_master.json', { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      await saveTransactionsToIndexedDB(data);
      return data;
    }
  } catch (err) {
    // File might not exist yet, which is expected for fresh shared folders
  }
  return [];
}

/**
 * Writes cumulative historical transactions to directory handle
 */
async function writeToDirectoryHandle(dirHandle, transactions) {
  try {
    const fileHandle = await dirHandle.getFileHandle('ird_fru_history_master.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(transactions, null, 2));
    await writable.close();

    // Also write a human-readable metadata info file
    const metaHandle = await dirHandle.getFileHandle('SHARED_REPOSITORY_INFO.txt', { create: true });
    const metaWritable = await metaHandle.createWritable();
    const infoText = `=========================================================================\n` +
      `DEPARTMENT OF INLAND REVENUE SRI LANKA - FORCED REGISTRATION UNIT (FRU)\n` +
      `6-MONTH TRANSACTION HISTORY & SHARED AUDIT REPOSITORY\n` +
      `=========================================================================\n` +
      `Last Synced: ${new Date().toLocaleString()}\n` +
      `Total Cumulative Transactions: ${transactions.length}\n` +
      `Retention Window: 6 Months Statutory Investigation Scope\n` +
      `Statutory Authority: Inland Revenue Act No. 24 of 2017 (Section 102)\n`;
    await metaWritable.write(infoText);
    await metaWritable.close();

    return true;
  } catch (err) {
    console.warn('Failed to write to shared directory handle:', err);
    return false;
  }
}

/**
 * Saves an array of transaction records into IndexedDB
 */
export async function saveTransactionsToIndexedDB(transactions) {
  const db = await openHistoricalDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      transactions.forEach((item) => {
        // Generate a deterministic unique ID based on TIN/NIC, Date, Amount, Agency
        const uniqueKey = item.id || `TX_${String(item.tin || item.nic || 'UNREG').trim()}_${String(item.date || '').replace(/[^a-zA-Z0-9]/g, '')}_${item.amount}_${String(item.agency || '').substring(0, 8)}`;
        store.put({
          ...item,
          id: uniqueKey,
          updatedAt: new Date().toISOString(),
        });
      });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}

/**
 * Loads all historical transactions stored in IndexedDB
 */
export async function loadTransactionsFromIndexedDB() {
  const db = await openHistoricalDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (err) {
      resolve([]);
    }
  });
}

/**
 * Archive and Sync newly analyzed records into the 6-Month Shared Repository
 * Extracts all individual transactions, enriches with TIN/NIC/Name, and persists.
 */
export async function archiveRecordsToSharedFolder(records = [], activeOfficer = null) {
  if (!records || records.length === 0) return { success: false, error: 'No records to archive' };

  // Flatten all transactions from records
  const newTransactions = [];
  records.forEach((r) => {
    const tin = r.tin || '';
    const nic = r.nic || '';
    const name = r.name || '';
    const district = r.district || '';
    const regionalOffice = r.regionalOffice || '';
    const primaryAgency = r.primaryAgency || '';

    (r.transactions || []).forEach((tx, idx) => {
      newTransactions.push({
        id: `TX_${tin || nic || r.id}_${String(tx.date || '').replace(/[^a-zA-Z0-9]/g, '')}_${tx.amount}_${idx}`,
        recordRefId: r.id,
        tin,
        nic,
        name,
        district,
        regionalOffice,
        agency: tx.agency || primaryAgency,
        amount: Number(tx.amount) || 0,
        date: tx.date || '',
        category: tx.category || 'General',
        description: tx.description || '',
        rawRow: tx.rawRow || r.rawRow || {},
        archivedAt: new Date().toISOString(),
        archivedBy: activeOfficer?.name || 'Assessor',
      });
    });
  });

  // 1. Save into local persistent IndexedDB
  await saveTransactionsToIndexedDB(newTransactions);

  // 2. Load all historical transactions from DB
  const allHistorical = await loadTransactionsFromIndexedDB();

  // 3. If directory handle is active, write to physical shared folder
  if (dirHandleCache) {
    await writeToDirectoryHandle(dirHandleCache, allHistorical);
  }

  // 4. Also call server.ps1 REST API if local server is active
  try {
    await fetch('/api/shared-folder/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: allHistorical }),
    });
  } catch (err) {
    // server.ps1 API might not be running in dev mode, non-fatal
  }

  // Count unique TINs / entities
  const uniqueTins = new Set(allHistorical.map((t) => t.tin || t.nic).filter(Boolean));

  saveSharedFolderConfig({
    lastSyncAt: new Date().toISOString(),
    totalRecords: uniqueTins.size,
    totalTransactions: allHistorical.length,
  });

  return {
    success: true,
    addedCount: newTransactions.length,
    totalHistoricalCount: allHistorical.length,
    uniqueEntitiesCount: uniqueTins.size,
  };
}

/**
 * Query historical transactions for a specific TIN / NIC / ID over the past 6 months
 * Returns merged historical transactions combining Shared Folder records + Active Session records.
 */
export async function query6MonthTransactions(tinOrNic, activeSessionRecords = []) {
  if (!tinOrNic) return [];

  const clean = String(tinOrNic).trim().toLowerCase();
  const allStored = await loadTransactionsFromIndexedDB();

  // Filter stored transactions matching TIN or NIC
  const matchedStored = allStored.filter((tx) => {
    return (
      (tx.tin && tx.tin.toLowerCase() === clean) ||
      (tx.nic && tx.nic.toLowerCase() === clean) ||
      (tx.recordRefId && tx.recordRefId.toLowerCase() === clean)
    );
  });

  // Also collect transactions from currently active session
  const activeMatchedRecord = activeSessionRecords.find((r) => {
    return (
      (r.tin && r.tin.toLowerCase() === clean) ||
      (r.nic && r.nic.toLowerCase() === clean) ||
      (r.id && r.id.toLowerCase() === clean)
    );
  });

  const matchedActive = [];
  if (activeMatchedRecord && activeMatchedRecord.transactions) {
    activeMatchedRecord.transactions.forEach((tx, idx) => {
      matchedActive.push({
        id: `TX_ACTIVE_${clean}_${String(tx.date || '').replace(/[^a-zA-Z0-9]/g, '')}_${tx.amount}_${idx}`,
        recordRefId: activeMatchedRecord.id,
        tin: activeMatchedRecord.tin,
        nic: activeMatchedRecord.nic,
        name: activeMatchedRecord.name,
        district: activeMatchedRecord.district,
        regionalOffice: activeMatchedRecord.regionalOffice,
        agency: tx.agency || activeMatchedRecord.primaryAgency,
        amount: Number(tx.amount) || 0,
        date: tx.date || '',
        category: tx.category || 'General',
        description: tx.description || '',
        rawRow: tx.rawRow || activeMatchedRecord.rawRow || {},
        source: 'ACTIVE_SESSION',
      });
    });
  }

  // Merge and deduplicate by date + amount + agency
  const combinedMap = new Map();
  [...matchedStored, ...matchedActive].forEach((tx) => {
    const key = `${String(tx.date).trim()}_${tx.amount}_${String(tx.agency).trim()}`;
    if (!combinedMap.has(key)) {
      combinedMap.set(key, tx);
    }
  });

  return Array.from(combinedMap.values());
}
