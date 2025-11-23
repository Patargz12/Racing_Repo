"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Image from "next/image";
import Link from "next/link";
import { Streamdown } from "streamdown";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

// Get the API URL from environment variable or use localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface ExcelData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Custom hook for typing animation (same as chat-message.tsx)
function useTypingAnimation(
  text: string,
  speed: number = 1,
  charsPerInterval: number = 3
) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        // Add multiple characters at once for faster rendering
        const nextIndex = Math.min(
          currentIndex + charsPerInterval,
          text.length
        );
        setDisplayedText(text.slice(0, nextIndex));
        currentIndex = nextIndex;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, charsPerInterval]);

  return { displayedText, isComplete };
}

// Message component with streaming effect
function StreamingMessage({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  
  // Use typing animation for bot messages (ChatGPT-like speed)
  const { displayedText } = useTypingAnimation(
    isUser ? "" : message.content,
    15, // 15ms interval
    5 // 5 characters per interval = very fast like ChatGPT
  );

  const contentToDisplay = isUser ? message.content : displayedText;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isUser
            ? "bg-[#EB0A1E] text-white shadow-[0_0_15px_rgba(235,10,30,0.5)]"
            : "bg-gray-800 text-gray-100 border-2 border-[#EB0A1E]/30"
        }`}
      >
        {isUser ? "U" : "T"}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.sender === "user"
            ? "bg-[#EB0A1E] text-white shadow-[0_0_15px_rgba(235,10,30,0.3)]"
            : "bg-gray-800 text-gray-100 border border-gray-700"
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <Streamdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              {contentToDisplay}
            </Streamdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplainPage() {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorResponse | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isExplanationStreaming, setIsExplanationStreaming] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Typing animation for the initial explanation
  const { displayedText: streamedExplanation, isComplete: isExplanationComplete } = useTypingAnimation(
    explanation,
    15, // 15ms interval
    5 // 5 characters per interval
  );

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Store the original file for backend upload
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: (string | number | boolean | null)[][] =
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          setExcelData({ headers, rows });
          setFileName(file.name);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file. Please upload a valid Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle analyze button
  const handleAnalyze = async () => {
    if (!uploadedFile || !excelData) return;

    setIsLoading(true);
    setExplanation(""); // Clear previous explanation
    setErrorInfo(null); // Clear previous errors
    setMessages([]); // Clear chat messages

    try {
      // Create FormData to send file to backend
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("mode", "explain");
      formData.append("sessionId", sessionId); // Add session ID

      // Call backend API
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Set error info from backend response
        setErrorInfo({
          error: result.error || "Failed to generate response",
          details: result.details || `HTTP error! status: ${response.status}`,
        });
      } else if (result.answer) {
        setExplanation(result.answer);
        setErrorInfo(null);
      } else {
        setErrorInfo({
          error: "No response received",
          details: "The server did not return any explanation.",
        });
      }
    } catch (error) {
      console.error("Error analyzing data:", error);
      setErrorInfo({
        error: "Network or connection error",
        details:
          error instanceof Error
            ? error.message
            : "Failed to connect to the server. Please check if the backend is running.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setExcelData(null);
    setFileName("");
    setExplanation("");
    setUploadedFile(null);
    setErrorInfo(null);
    setMessages([]);
    setSessionId(generateSessionId()); // Generate new session ID
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle follow-up chat messages
  const handleSendMessage = async (message?: any) => {
    const text = message?.text || "";
    if (isChatLoading || !text.trim()) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message for bot
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    setIsChatLoading(true);

    try {
      // Create FormData to send question
      const formData = new FormData();
      formData.append("question", text);
      formData.append("sessionId", sessionId);

      // Call backend API
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      // Remove loading message
      setMessages((prev) => prev.filter((m) => !m.isLoading));

      if (response.ok && result.success && result.answer) {
        // Add bot response
        const botMessage: Message = {
          id: Date.now().toString(),
          content: result.answer,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `❌ ${result.error || "Failed to get response"}`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter((m) => !m.isLoading));

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `❌ ${
          error instanceof Error
            ? error.message
            : "Failed to connect to the server"
        }`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#2d0a0f] via-[#1a0508] to-black pointer-events-none" />

      {/* Red glow overlay */}
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-[#EB0A1E]/20 via-[#EB0A1E]/5 to-transparent pointer-events-none blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Image
                src="/toyota_logo.png"
                alt="Toyota Gazoo Racing"
                width={150}
                height={60}
                className="drop-shadow-[0_0_20px_rgba(235,10,30,0.5)] cursor-pointer hover:scale-105 transition-transform"
              />
            </Link>
            <div className="h-8 w-1 bg-[#EB0A1E] shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
            <h1 className="text-3xl font-bold uppercase tracking-wide">
              Data Explain
            </h1>
          </div>
          <Link href="/">
            <button className="group relative px-8 py-3 bg-[#EB0A1E] rounded-md transition-all duration-300 hover:bg-[#c40818] hover:scale-105 active:scale-100 hover:shadow-[0_0_30px_rgba(235,10,30,0.8)] flex items-center gap-3">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-white font-bold uppercase tracking-wide">Back</span>
            </button>
          </Link>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 bg-[#EB0A1E] shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
            <h2 className="text-xl font-bold uppercase tracking-wide">
              Upload Excel File
            </h2>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              dragActive
                ? "border-[#EB0A1E] bg-[#EB0A1E]/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.xlsm,.xlsb"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-[#EB0A1E]/10 rounded-full">
                  <svg
                    className="w-12 h-12 text-[#EB0A1E]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">
                    Drop your Excel file here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: XLS, XLSX, XLSM, XLSB
                  </p>
                </div>
                {fileName && (
                  <div className="mt-2 px-4 py-2 bg-[#EB0A1E]/20 rounded-md border border-[#EB0A1E]/50">
                    <p className="text-sm font-medium text-[#EB0A1E]">
                      📄 {fileName}
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {fileName && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-8 py-3 bg-[#EB0A1E] hover:bg-[#c40818] rounded-md transition-all duration-300 font-bold uppercase tracking-wide hover:shadow-[0_0_20px_rgba(235,10,30,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Analyzing..." : "Analyze Data"}
              </button>
              <button
                onClick={handleClear}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-300 border border-gray-700 hover:border-[#EB0A1E]"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Data Table Section */}
        {excelData && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-[#EB0A1E] shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                Data Preview
              </h2>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-gray-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#EB0A1E] [&::-webkit-scrollbar-thumb]:to-[#c40818] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-900 hover:[&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(235,10,30,0.8)]">
                <table className="w-full">
                  <thead className="bg-gray-900 sticky top-0 z-10">
                    <tr>
                      {excelData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide border-b border-[#EB0A1E]/30"
                        >
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 text-sm text-gray-300"
                          >
                            {cell !== null && cell !== undefined
                              ? String(cell)
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-900/80 text-sm text-gray-400 border-t border-gray-800">
                Showing {excelData.rows.length} rows ×{" "}
                {excelData.headers.length} columns
              </div>
            </div>
          </div>
        )}

        {/* Explanation Section */}
        {(explanation || isLoading || errorInfo) && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-[#EB0A1E] shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                AI Explanation
              </h2>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-700 border-t-[#EB0A1E] rounded-full animate-spin" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#EB0A1E]/30 rounded-full animate-ping" />
                  </div>
                  <p className="text-gray-400 animate-pulse">
                    Analyzing racing data with AI...
                  </p>
                </div>
              ) : errorInfo ? (
                <div className="border-l-4 border-[#EB0A1E] bg-[#EB0A1E]/10 p-6 rounded-r-lg">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <svg
                        className="w-6 h-6 text-[#EB0A1E]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#EB0A1E] mb-1">
                          {errorInfo.error}
                        </h3>
                        {errorInfo.details && (
                          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-2">
                            <p className="text-sm font-semibold text-gray-400 mb-2">
                              Error Details:
                            </p>
                            <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
                              {errorInfo.details}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleAnalyze}
                          className="px-6 py-2 bg-[#EB0A1E] hover:bg-[#c40818] rounded-md transition-all duration-300 font-semibold text-sm hover:shadow-[0_0_15px_rgba(235,10,30,0.6)]"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => setErrorInfo(null)}
                          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-300 border border-gray-700 text-sm"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <Streamdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {streamedExplanation}
                  </Streamdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Section - Show after explanation is generated */}
        {explanation && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-[#EB0A1E] shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                Ask Follow-up Questions
              </h2>
            </div>

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-4 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#EB0A1E] [&::-webkit-scrollbar-thumb]:to-[#c40818] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-900 hover:[&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(235,10,30,0.8)]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <StreamingMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Chat Input */}
            <PromptInput
              onSubmit={async (message) => {
                await handleSendMessage(message);
              }}
            >
              <PromptInputTextarea
                placeholder="Ask a follow-up question about the data..."
                className="resize-none overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
                style={{
                  minHeight: "48px",
                  maxHeight: "140px",
                  fieldSizing: "content",
                } as any}
              />
              <PromptInputFooter>
                <PromptInputSubmit
                  disabled={isChatLoading}
                  status={isChatLoading ? "submitted" : undefined}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        )}
      </div>

      {/* Racing line accent */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#EB0A1E] to-transparent shadow-[0_0_20px_rgba(235,10,30,0.8)] z-20" />
    </div>
  );
}
