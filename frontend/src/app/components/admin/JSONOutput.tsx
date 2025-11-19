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
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 shadow-lg shadow-red-500/5 overflow-hidden backdrop-blur-sm">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">JSON Output</h2>
            <p className="text-sm text-gray-400 mt-1">
              MongoDB-ready JSON format
            </p>
          </div>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 transition-all shadow-md shadow-red-500/20"
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
            className="block text-sm font-semibold text-white"
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
              className="flex-1 px-4 py-3 text-sm rounded-lg border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              disabled={uploading}
            />
            <button
              onClick={onUploadToDatabase}
              disabled={uploading || !collectionName.trim()}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md shadow-red-500/20"
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
          <p className="text-xs text-gray-500">
            Enter a unique collection name for this upload. This will create a
            new collection in MongoDB.
          </p>
        </div>

        {/* JSON Display */}
        <div className="relative rounded-xl overflow-hidden border border-gray-800">
          <div className="bg-black/50 px-4 py-2 border-b border-gray-800">
            <span className="text-xs font-mono text-red-400">JSON</span>
          </div>
          <pre className="p-6 overflow-auto max-h-96 text-sm text-gray-300 font-mono leading-relaxed bg-black/30">
            <code>{jsonString}</code>
          </pre>
        </div>

        {uploadMessage && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              uploadMessage.type === "success"
                ? "bg-red-950/30 text-red-400 border border-red-900/50"
                : "bg-red-950/50 text-red-300 border border-red-900/50"
            }`}
          >
            {uploadMessage.text}
          </div>
        )}

        <div className="flex items-center gap-6 text-xs text-gray-500 bg-gray-950/50 p-4 rounded-lg border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>
              <strong className="text-gray-300">Format:</strong>{" "}
              MongoDB-compatible JSON
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>
              <strong className="text-gray-300">Records:</strong>{" "}
              {excelData.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
