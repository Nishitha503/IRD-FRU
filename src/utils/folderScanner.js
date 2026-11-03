/**
 * Folder & File Ingestion Utility for IRD FRU
 * Recursively scans folders and subfolders to extract all valid Excel (.xlsx, .xls) and CSV files.
 * Supports multi-folder Drag & Drop as well as Directory Input Selection.
 */

const VALID_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

/**
 * Checks if a filename is a valid, non-temporary Excel or CSV file
 */
export function isValidExcelOrCsv(fileName) {
  if (!fileName || typeof fileName !== 'string') return false;
  // Ignore temporary lock files created by Excel (e.g., ~$Book1.xlsx) and system hidden files
  if (fileName.startsWith('~$') || fileName.startsWith('._') || fileName.startsWith('.')) {
    return false;
  }
  const lower = fileName.toLowerCase().trim();
  return VALID_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Recursively extracts all valid Excel/CSV files from DataTransferItems
 * Handles multiple folders dropped at the same time, nested subdirectories, and standalone files.
 */
export async function extractFilesFromDataTransfer(dataTransfer) {
  const extractedFiles = [];

  // 1. If webkitGetAsEntry is supported (supports folder recursion & multi-folder drop)
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    const queue = [];

    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (typeof item.webkitGetAsEntry === 'function') {
        const entry = item.webkitGetAsEntry();
        if (entry) queue.push({ entry, pathPrefix: '' });
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && isValidExcelOrCsv(file.name)) {
          extractedFiles.push(file);
        }
      }
    }

    if (queue.length > 0) {
      // Helper to read entries of a directory in chunks (Chrome returns at most 100 entries per batch)
      const readAllDirectoryEntries = async (dirReader) => {
        const allEntries = [];
        let batch = await new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
        while (batch && batch.length > 0) {
          allEntries.push(...batch);
          batch = await new Promise((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });
        }
        return allEntries;
      };

      // Traverse all entries in the queue recursively
      while (queue.length > 0) {
        const { entry, pathPrefix } = queue.shift();

        if (entry.isFile) {
          try {
            const file = await new Promise((resolve, reject) => {
              entry.file(resolve, reject);
            });
            if (isValidExcelOrCsv(file.name)) {
              // Tag with folder relative path so source folder is clearly visible
              const relativePath = pathPrefix
                ? `${pathPrefix}/${file.name}`
                : (entry.fullPath ? entry.fullPath.replace(/^\//, '') : file.name);
              file._folderPath = relativePath;
              extractedFiles.push(file);
            }
          } catch (err) {
            console.warn(`Could not read file entry: ${entry.name}`, err);
          }
        } else if (entry.isDirectory) {
          try {
            const dirReader = entry.createReader();
            const childEntries = await readAllDirectoryEntries(dirReader);
            const nextPrefix = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
            for (const child of childEntries) {
              queue.push({ entry: child, pathPrefix: nextPrefix });
            }
          } catch (err) {
            console.warn(`Could not read directory entry: ${entry.name}`, err);
          }
        }
      }

      if (extractedFiles.length > 0) {
        return extractedFiles;
      }
    }
  }

  // 2. Fallback to standard dataTransfer.files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const f = dataTransfer.files[i];
      if (isValidExcelOrCsv(f.name)) {
        extractedFiles.push(f);
      }
    }
  }

  return extractedFiles;
}

/**
 * Filter an array or FileList from an <input type="file" webkitdirectory>
 * preserving webkitRelativePath as _folderPath
 */
export function filterExcelAndCsvFiles(fileList) {
  const result = [];
  const files = Array.from(fileList || []);
  for (const f of files) {
    if (isValidExcelOrCsv(f.name)) {
      if (f.webkitRelativePath) {
        f._folderPath = f.webkitRelativePath;
      }
      result.push(f);
    }
  }
  return result;
}
