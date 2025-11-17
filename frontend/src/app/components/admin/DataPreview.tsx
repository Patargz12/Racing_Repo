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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Excel Preview</h2>
            <p className="text-sm text-slate-600 mt-1">
              Viewing {excelData.length}{" "}
              {excelData.length === 1 ? "row" : "rows"}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">
              {excelData.length} Records
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-left font-semibold text-slate-900 whitespace-nowrap"
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
                className={`border-b border-slate-100 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                } hover:bg-blue-50 transition-colors`}
              >
                {columns.map((col) => (
                  <td
                    key={`${rowIndex}-${col}`}
                    className="px-6 py-4 text-slate-700"
                  >
                    {row[col] === null ? (
                      <span className="text-slate-400 italic text-xs">
                        null
                      </span>
                    ) : typeof row[col] === "boolean" ? (
                      <span className="text-blue-600 font-medium text-xs bg-blue-50 px-2 py-1 rounded">
                        {String(row[col])}
                      </span>
                    ) : typeof row[col] === "number" ? (
                      <span className="text-green-700 font-medium">
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
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-slate-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
