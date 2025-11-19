import { Zap, CheckCircle, Download } from "lucide-react";

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/10 transition-all">
        <div className="bg-red-950/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-red-900/30">
          <Zap className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Lightning Fast
        </h3>
        <p className="text-gray-400 text-sm">
          Real-time conversion with instant results
        </p>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/10 transition-all">
        <div className="bg-red-950/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-red-900/30">
          <CheckCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Multi-Sheet Support
        </h3>
        <p className="text-gray-400 text-sm">
          Convert all sheets in your workbook
        </p>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/10 transition-all">
        <div className="bg-red-950/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-red-900/30">
          <Download className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Easy Export
        </h3>
        <p className="text-gray-400 text-sm">Download JSON files directly</p>
      </div>
    </div>
  );
}
