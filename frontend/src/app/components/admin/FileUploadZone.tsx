import { Upload } from "lucide-react";

interface FileUploadZoneProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadZone({
  isDragging,
  isProcessing,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
}: FileUploadZoneProps) {
  return (
    <div className="mb-12 max-w-4xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-16 transition-all ${
          isDragging
            ? "border-red-500 bg-red-950/30 scale-[1.02] shadow-lg shadow-red-500/20"
            : "border-gray-700 bg-gray-900/50 hover:border-red-600 hover:bg-gray-900"
        }`}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFileChange}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload Excel file"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          {isProcessing ? (
            <>
              <div className="animate-spin">
                <Upload className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-white font-semibold text-lg">
                Processing file...
              </p>
            </>
          ) : (
            <>
              <div className="bg-red-950/50 p-6 rounded-full border border-red-900/50">
                <Upload className="w-12 h-12 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-xl mb-1">
                  Drag and drop your Excel file here
                </p>
                <p className="text-gray-400 text-base">
                  or click to browse (.xlsx, .xls, .csv)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
