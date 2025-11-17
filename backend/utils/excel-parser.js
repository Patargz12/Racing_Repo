const XLSX = require("xlsx");

/**
 * Parse Excel file buffer and convert to text format for Gemini
 * @param {Buffer} fileBuffer - The Excel file buffer
 * @param {string} fileName - The name of the file
 * @returns {string} - Formatted text representation of the Excel data
 */
function parseExcelToText(fileBuffer, fileName) {
  try {
    // Read the workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    let fullText = `📊 Excel File: ${fileName}\n\n`;

    // Process each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Add sheet header
      fullText += `\n${"=".repeat(50)}\n`;
      fullText += `Sheet ${index + 1}: ${sheetName}\n`;
      fullText += `${"=".repeat(50)}\n\n`;

      if (jsonData.length === 0) {
        fullText += "  (Empty sheet)\n";
        return;
      }

      // Get headers (first row)
      const headers = jsonData[0];

      // Convert to readable table format
      jsonData.forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          // Header row
          fullText += `Headers: ${row.join(" | ")}\n`;
          fullText += `${"-".repeat(50)}\n`;
        } else {
          // Data rows
          const rowData = headers
            .map((header, colIndex) => {
              const value = row[colIndex] !== undefined ? row[colIndex] : "";
              return `${header}: ${value}`;
            })
            .join(", ");

          fullText += `Row ${rowIndex}: ${rowData}\n`;
        }
      });

      // Add summary stats
      fullText += `\n📈 Summary: ${jsonData.length - 1} data rows (excluding header)\n`;
    });

    return fullText;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Parse CSV file buffer and convert to text format for Gemini
 * @param {Buffer} fileBuffer - The CSV file buffer
 * @param {string} fileName - The name of the file
 * @returns {string} - Formatted text representation of the CSV data
 */
function parseCSVToText(fileBuffer, fileName) {
  try {
    // Convert buffer to string
    const csvText = fileBuffer.toString("utf-8");

    // Parse CSV using XLSX
    const workbook = XLSX.read(csvText, { type: "string" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let fullText = `📊 CSV File: ${fileName}\n\n`;
    fullText += `${"=".repeat(50)}\n`;

    if (jsonData.length === 0) {
      fullText += "  (Empty file)\n";
      return fullText;
    }

    // Get headers (first row)
    const headers = jsonData[0];

    // Convert to readable table format
    jsonData.forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        // Header row
        fullText += `Headers: ${row.join(" | ")}\n`;
        fullText += `${"-".repeat(50)}\n`;
      } else {
        // Data rows
        const rowData = headers
          .map((header, colIndex) => {
            const value = row[colIndex] !== undefined ? row[colIndex] : "";
            return `${header}: ${value}`;
          })
          .join(", ");

        fullText += `Row ${rowIndex}: ${rowData}\n`;
      }
    });

    // Add summary stats
    fullText += `\n📈 Summary: ${jsonData.length - 1} data rows (excluding header)\n`;

    return fullText;
  } catch (error) {
    console.error("Error parsing CSV file:", error);
    throw new Error(`Failed to parse CSV file: ${error.message}`);
  }
}

/**
 * Parse file based on its extension
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The name of the file
 * @returns {string} - Formatted text representation
 */
function parseFile(fileBuffer, fileName) {
  const extension = fileName.toLowerCase().split(".").pop();

  if (extension === "csv") {
    return parseCSVToText(fileBuffer, fileName);
  } else if (extension === "xlsx" || extension === "xls") {
    return parseExcelToText(fileBuffer, fileName);
  } else {
    throw new Error(`Unsupported file type: ${extension}`);
  }
}

module.exports = {
  parseExcelToText,
  parseCSVToText,
  parseFile,
};

