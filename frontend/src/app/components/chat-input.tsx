"use client";

import type React from "react";
import { useState } from "react";
import {
  FileUpload,
  FileUploadTrigger,
  FileUploadContent,
} from "@/components/ui/file-upload";
import { X, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleSend = () => {
    if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
      onSend(input, attachedFiles);
      setInput("");
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilesAdded = (files: File[]) => {
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <FileUpload
      onFilesAdded={handleFilesAdded}
      multiple={true}
      accept=".xlsx,.xls,.csv"
      disabled={isLoading}
    >
      <div className="w-full px-4 py-6 flex justify-center">
        <div className="w-full max-w-4xl flex flex-col gap-2">
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm border border-border"
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(file.size)})
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    aria-label="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Container */}
          <div className="flex gap-3">
            <div className="flex-1 flex gap-2 items-center px-4 py-3 bg-input border border-border rounded-lg focus-within:ring-2 focus-within:ring-accent">
              <FileUploadTrigger asChild>
                <button
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Attach file"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </FileUploadTrigger>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about racing, specs, events..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none disabled:opacity-50"
                aria-label="Chat message input"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 min-w-fit"
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      <FileUploadContent>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-6 rounded-full bg-primary/10">
            <Paperclip className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Drop Excel file here</h3>
            <p className="text-muted-foreground">
              Release to attach Excel files (.xlsx, .xls, .csv) to your message
            </p>
          </div>
        </div>
      </FileUploadContent>
    </FileUpload>
  );
}
