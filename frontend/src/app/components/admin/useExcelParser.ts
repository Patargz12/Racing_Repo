import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { ExcelDataRow, MAX_FILE_SIZE } from "./types";

export function useExcelParser() {
    const [excelData, setExcelData] = useState<ExcelDataRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const parseExcel = useCallback((file: File) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            setError(
                `File size is ${fileSizeMB} MB. Maximum allowed size is ${maxSizeMB} MB.`
            );
            return;
        }

        setIsProcessing(true);
        setError(null);

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    setError("Failed to read file");
                    setIsProcessing(false);
                    return;
                }

                // Parse Excel file
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheet = workbook.SheetNames[0];

                if (!firstSheet) {
                    setError("No sheets found in the Excel file");
                    setIsProcessing(false);
                    return;
                }

                // Get data with proper type conversion
                const worksheet = workbook.Sheets[firstSheet];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: null,
                    blankrows: false,
                }) as ExcelDataRow[];

                if (jsonData.length === 0) {
                    setError("No data found in the Excel file");
                    setIsProcessing(false);
                    return;
                }

                // Preserve data types - convert string numbers back to numbers
                const processedData = jsonData.map((row) => {
                    const newRow: ExcelDataRow = {};
                    for (const [key, value] of Object.entries(row)) {
                        if (value === null) {
                            newRow[key] = null;
                        } else if (
                            typeof value === "string" &&
                            !isNaN(Number(value)) &&
                            value.trim() !== ""
                        ) {
                            newRow[key] = Number(value);
                        } else if (typeof value === "number") {
                            newRow[key] = value;
                        } else if (typeof value === "boolean") {
                            newRow[key] = value;
                        } else {
                            newRow[key] = String(value).trim();
                        }
                    }
                    return newRow;
                });

                setExcelData(processedData);
                setError(null);
                setIsProcessing(false);
            } catch (error) {
                setError(
                    `Error parsing Excel: ${error instanceof Error ? error.message : "Unknown error"
                    }`
                );
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file");
            setIsProcessing(false);
        };

        reader.readAsArrayBuffer(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (
                    file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                    file.type === "application/vnd.ms-excel" ||
                    file.name.endsWith(".xlsx") ||
                    file.name.endsWith(".xls") ||
                    file.name.endsWith(".csv")
                ) {
                    parseExcel(file);
                } else {
                    setError("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
                }
            }
        },
        [parseExcel]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.currentTarget.files;
            if (files && files.length > 0) {
                parseExcel(files[0]);
            }
        },
        [parseExcel]
    );

    return {
        excelData,
        error,
        isProcessing,
        handleDrop,
        handleFileChange,
        setExcelData,
    };
}
