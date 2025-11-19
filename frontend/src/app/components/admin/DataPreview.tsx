import { ChevronLeft, ChevronRight } from "lucide-react";

type ExcelDataRow = Record<string, string | number | boolean | null>;

interface DataPreviewProps {
  excelData: ExcelDataRow[];
  columns: string[];
  paginatedData: ExcelDataRow[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function DataPreview({
  excelData,
  columns,
  paginatedData,
  currentPage,
  totalPages,
  startIndex,
  onPreviousPage,
  onNextPage,
}: DataPreviewProps) {
  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 shadow-lg shadow-red-500/5 overflow-hidden backdrop-blur-sm">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Excel Preview</h2>
            <p className="text-sm text-gray-400 mt-1">
              Viewing {excelData.length}{" "}
              {excelData.length === 1 ? "row" : "rows"}
            </p>
          </div>
          <div className="bg-red-950/50 px-4 py-2 rounded-lg border border-red-900/50">
            <span className="text-sm font-semibold text-red-400">
              {excelData.length} Records
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-950/50 border-b border-gray-800">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-left font-semibold text-white whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={startIndex + rowIndex}
                className={`border-b border-gray-800 ${
                  rowIndex % 2 === 0 ? "bg-gray-900/30" : "bg-gray-950/30"
                } hover:bg-red-950/20 transition-colors`}
              >
                {columns.map((col) => (
                  <td
                    key={`${rowIndex}-${col}`}
                    className="px-6 py-4 text-gray-300"
                  >
                    {row[col] === null ? (
                      <span className="text-gray-600 italic text-xs">
                        null
                      </span>
                    ) : typeof row[col] === "boolean" ? (
                      <span className="text-red-400 font-medium text-xs bg-red-950/50 px-2 py-1 rounded border border-red-900/30">
                        {String(row[col])}
                      </span>
                    ) : typeof row[col] === "number" ? (
                      <span className="text-red-400 font-medium">
                        {String(row[col])}
                      </span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-gray-950/50 px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-gray-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
