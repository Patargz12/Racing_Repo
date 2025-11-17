import { FileSpreadsheet } from "lucide-react";

export default function AdminNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-slate-700" />
            <h1 className="text-xl font-bold text-slate-900">Excel to JSON</h1>
          </div>
          <div className="text-sm text-white bg-red-500 px-3 py-1.5 rounded-full">
            Toyota Hackathon
          </div>
        </div>
      </div>
    </nav>
  );
}
