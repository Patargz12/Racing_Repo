import { FileSpreadsheet } from "lucide-react";

export default function AdminNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-red-900/30 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold text-white">Excel to JSON</h1>
          </div>
          <div className="text-sm text-white bg-gradient-to-r from-red-600 to-red-500 px-4 py-1.5 rounded-full font-semibold shadow-lg shadow-red-500/30">
            GAZOO Racing
          </div>
        </div>
      </div>
    </nav>
  );
}
