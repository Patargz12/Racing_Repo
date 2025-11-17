"use client";

import { useRef, useEffect, useState } from "react";
import { useChatStore, type Message } from "@/app/lib/chat-store";
import { sendChatMessage } from "@/app/lib/chat-api";
import { ChatHeader } from "@/app/components/chat-header";
import { ChatMessage } from "@/app/components/chat-message";
import { ChatInput } from "@/app/components/chat-input";
import { RecommendedQuestions } from "@/app/components/recommended-search";

export function ChatContainer() {
  const { messages, addMessage, removeLastMessage } = useChatStore();
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

  const handleSendMessage = async (content: string, files?: File[]) => {
    // Prevent sending if already loading or chatbot is typing
    if (isLoading || isChatbotTyping) {
      return;
    }

    // Create user message content with file information if present
    let messageContent = content;
    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.name).join(", ");
      messageContent = content
        ? `${content}\n\n📎 Attached: ${fileNames}`
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
      // Call the backend API (with files if needed)
      const answer = await sendChatMessage(content, files);

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

      // Add error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Sorry, I encountered an error. Please try again.";

      addMessage({
        content: `❌ ${errorMessage}`,
        sender: "bot",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for clipboard API
    });
  };

  const handleClearHistory = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Clear all chat history?")
    ) {
      useChatStore.getState().clearMessages();
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
            <RecommendedQuestions onQuestionClick={handleSendMessage} />
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

      <ChatInput onSend={handleSendMessage} isLoading={isLoading || isChatbotTyping} />
    </div>
  );
}
