"use client"

export function RacingLoader() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-6 flex items-center justify-center">
        <div
          className="absolute inset-0 border-b-2 border-red-600 dark:border-red-500"
          style={{ animation: "trackScroll 1.2s linear infinite" }}
        />
        <div
          className="absolute text-lg font-bold"
          style={{ animation: "carMove 1.2s ease-in-out infinite" }}
        >
          🏎️
        </div>
      </div>

      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
        Thinking
        <span style={{ animation: "blink 1.4s ease-in-out infinite" }}>.</span>
        <span style={{ animation: "blink 1.4s ease-in-out infinite 0.2s" }}>.</span>
        <span style={{ animation: "blink 1.4s ease-in-out infinite 0.4s" }}>.</span>
      </span>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes trackScroll {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(8px);
          }
        }

        @keyframes carMove {
          0%, 100% {
            transform: translateX(-8px);
          }
          50% {
            transform: translateX(8px);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
