"use client";

interface ChatHeaderProps {
  onClearHistory?: () => void;
}

export function ChatHeader({ onClearHistory }: ChatHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">GR</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Toyota Gazoo Racing
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-xs text-muted-foreground">Racing Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClearHistory}
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Clear chat history"
          title="Clear chat history"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
