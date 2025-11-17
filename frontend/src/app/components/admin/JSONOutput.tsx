import { Copy, Check, Upload } from "lucide-react";

type ExcelDataRow = Record<string, string | number | boolean | null>;

interface JSONOutputProps {
  excelData: ExcelDataRow[];
  jsonString: string;
  copied: boolean;
  uploading: boolean;
  collectionName: string;
  uploadMessage: { type: "success" | "error"; text: string } | null;
  onCopy: () => void;
  onCollectionNameChange: (value: string) => void;
  onUploadToDatabase: () => void;
}

export default function JSONOutput({
  excelData,
  jsonString,
  copied,
  uploading,
  collectionName,
  uploadMessage,
  onCopy,
  onCollectionNameChange,
  onUploadToDatabase,
}: JSONOutputProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">JSON Output</h2>
            <p className="text-sm text-slate-600 mt-1">
              MongoDB-ready JSON format
            </p>
          </div>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
            aria-label="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy JSON
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Collection Name Input */}
        <div className="space-y-3">
          <label
            htmlFor="collectionName"
            className="block text-sm font-semibold text-slate-900"
          >
            MongoDB Collection Name
          </label>
          <div className="flex gap-3">
            <input
              id="collectionName"
              type="text"
              value={collectionName}
              onChange={(e) => onCollectionNameChange(e.target.value)}
              placeholder="e.g., Toyota_Sales_2024"
              className="flex-1 px-4 py-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={uploading}
            />
            <button
              onClick={onUploadToDatabase}
              disabled={uploading || !collectionName.trim()}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md"
              aria-label="Upload to MongoDB"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload to Database
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Enter a unique collection name for this upload. This will create a
            new collection in MongoDB.
          </p>
        </div>

        {/* JSON Display */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
            <span className="text-xs font-mono text-slate-300">JSON</span>
          </div>
          <pre className="p-6 overflow-auto max-h-96 text-sm text-slate-100 font-mono leading-relaxed bg-slate-900">
            <code>{jsonString}</code>
          </pre>
        </div>

        {uploadMessage && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              uploadMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {uploadMessage.text}
          </div>
        )}

        <div className="flex items-center gap-6 text-xs text-slate-500 bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>
              <strong className="text-slate-700">Format:</strong>{" "}
              MongoDB-compatible JSON
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>
              <strong className="text-slate-700">Records:</strong>{" "}
              {excelData.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
