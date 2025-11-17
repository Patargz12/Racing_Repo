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
            ? "border-orange-400 bg-orange-50 scale-[1.02]"
            : "border-slate-300 bg-white hover:border-orange-300 hover:bg-orange-50/30"
        }`}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFileChange}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0"
          aria-label="Upload Excel file"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          {isProcessing ? (
            <>
              <div className="animate-spin">
                <Upload className="w-12 h-12 text-orange-500" />
              </div>
              <p className="text-slate-700 font-semibold text-lg">
                Processing file...
              </p>
            </>
          ) : (
            <>
              <div className="bg-slate-100 p-6 rounded-full">
                <Upload className="w-12 h-12 text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-semibold text-xl mb-1">
                  Drag and drop your Excel file here
                </p>
                <p className="text-slate-500 text-base">
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
