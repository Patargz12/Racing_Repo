import { Zap, CheckCircle, Download } from "lucide-react";

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
        <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg mb-2">
          Lightning Fast
        </h3>
        <p className="text-slate-600 text-sm">
          Real-time conversion with instant results
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg mb-2">
          Multi-Sheet Support
        </h3>
        <p className="text-slate-600 text-sm">
          Convert all sheets in your workbook
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
        <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Download className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg mb-2">
          Easy Export
        </h3>
        <p className="text-slate-600 text-sm">Download JSON files directly</p>
      </div>
    </div>
  );
}
