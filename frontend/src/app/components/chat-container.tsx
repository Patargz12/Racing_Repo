"use client";

import { useRef, useEffect, useState } from "react";
import { useChatStore, type Message } from "@/app/lib/chat-store";
import { sendChatMessage } from "@/app/lib/chat-api";
import { ChatHeader } from "@/app/components/chat-header";
import { ChatMessage } from "@/app/components/chat-message";
import { RecommendedQuestions } from "@/app/components/recommended-search";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
} from "@/components/ai-elements/prompt-input";
import { Paperclip } from "lucide-react";

export function ChatContainer() {
  const { messages, addMessage, removeLastMessage, getOrCreateSessionId, clearSession } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(
    new Set()
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();

    // Add fade-in effect for new messages
    const newMessageIds = messages
      .map((m) => m.id)
      .filter((id) => !visibleMessages.has(id));
    if (newMessageIds.length > 0) {
      // Add a small delay for the fade-in effect
      const timer = setTimeout(() => {
        setVisibleMessages((prev) => {
          const updated = new Set(prev);
          newMessageIds.forEach((id) => updated.add(id));
          return updated;
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, visibleMessages]);

  // Check if chatbot is currently typing (has a loading message)
  const isChatbotTyping = messages.some(message => message.sender === "bot" && message.isLoading);

  const handleSendMessage = async (message: { text: string; files?: any[] }) => {
    // Prevent sending if already loading or chatbot is typing
    if (isLoading || isChatbotTyping || (!message.text.trim() && (!message.files || message.files.length === 0))) {
      return;
    }

    // Convert files from Prompt Kit format to File objects
    const files: File[] | undefined = message.files?.length
      ? await Promise.all(
          message.files.map(async (file: any) => {
            // If file has a blob URL, fetch and convert to File
            if (file.url?.startsWith("blob:")) {
              const response = await fetch(file.url);
              const blob = await response.blob();
              return new File([blob], file.filename || "file", { type: file.mediaType || blob.type });
            }
            return null;
          })
        ).then((results) => results.filter((f): f is File => f !== null))
      : undefined;

    // Create user message content with file information if present
    let messageContent = message.text;
    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.name).join(", ");
      messageContent = message.text
        ? `${message.text}\n\n📎 Attached: ${fileNames}`
        : `📎 Attached: ${fileNames}`;
    }

    // Add user message
    addMessage({
      content: messageContent,
      sender: "user",
    });

    // Add loading message for bot
    addMessage({
      content: "",
      sender: "bot",
      isLoading: true,
    });

    setIsLoading(true);

    try {
      // Get or create session ID for conversation persistence
      const sessionId = getOrCreateSessionId();
      
      // Call the backend API (with files if needed)
      const answer = await sendChatMessage(message.text, sessionId, files);

      // Remove loading message
      removeLastMessage();

      // Add bot response
      addMessage({
        content: answer,
        sender: "bot",
      });
    } catch (error) {
      // Remove loading message
      removeLastMessage();

      // Add error message with details
      let errorMessage =
        error instanceof Error
          ? error.message
          : "Sorry, I encountered an error. Please try again.";
      
      // Include error details if available
      const errorDetails = (error as any)?.details;
      if (errorDetails) {
        errorMessage += `\n\n**Details:** ${errorDetails}`;
      }

      addMessage({
        content: `❌ ${errorMessage}`,
        sender: "bot",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = async (questionText: string) => {
    await handleSendMessage({ text: questionText });
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for clipboard API
    });
  };

  const handleClearHistory = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Clear all chat history? This will start a new conversation session.")
    ) {
      clearSession();
    }
  };

  const handleToggleDarkMode = () => {
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      if (html.classList.contains("dark")) {
        html.classList.remove("dark");
      } else {
        html.classList.add("dark");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <ChatHeader
        onClearHistory={handleClearHistory}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 py-8">
        {/* Centered container with max-width */}
        <div className="w-full max-w-4xl">
          {messages.length === 0 ? (
            // Show recommended questions when there are no messages
            <RecommendedQuestions onQuestionClick={handleQuestionClick} />
          ) : (
            // Show chat messages when conversation has started
            <div className="space-y-6">
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`transition-all duration-500 ease-out ${
                    visibleMessages.has(message.id)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <ChatMessage message={message} onCopy={handleCopyMessage} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-4 py-6 flex justify-center">
        <div className="w-full max-w-4xl">
          <PromptInput
            onSubmit={async (message) => {
              await handleSendMessage(message);
            }}
            accept=".xlsx,.xls,.csv"
            multiple
            maxFiles={10}
            globalDrop
          >
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea 
              placeholder="Type a message or drop files..." 
              className="resize-none overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{
                minHeight: '48px',
                maxHeight: '140px',
                fieldSizing: 'content'
              } as any}
            />
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  onClick={(e) => {
                    e.preventDefault();
                    const fileInput = document.querySelector(
                      'input[type="file"]'
                    ) as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  <Paperclip className="size-4" />
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={isLoading || isChatbotTyping}
                status={isLoading || isChatbotTyping ? "submitted" : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
