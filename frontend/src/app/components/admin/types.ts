export type ExcelDataRow = Record<string, string | number | boolean | null>;

export interface UploadMessage {
    type: "success" | "error";
    text: string;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ROWS_PER_PAGE = 10;
