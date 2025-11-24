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
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

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

  const handleSendMessage = async (message?: any) => {
    // Prevent sending if already loading or chatbot is typing
    const text = message?.text || "";
    
    if (!message || isLoading || isChatbotTyping || !text.trim()) {
      return;
    }

    // Add user message
    addMessage({
      content: text,
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
      
      // Call the backend API
      const answer = await sendChatMessage(text, sessionId);

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

  return (
    <div className="relative flex flex-col h-screen text-foreground overflow-hidden">
      {/* Toyota Gazoo Racing gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d0a0f] via-[#1a0508] to-black pointer-events-none" />
      
      {/* Additional red glow overlay for depth */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-racing-red/20 via-racing-red/5 to-transparent pointer-events-none blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10">
        <ChatHeader onClearHistory={handleClearHistory} />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 py-8">
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

      <div className="relative z-10 w-full px-4 py-6 flex justify-center">
        <div className="w-full max-w-4xl">
          <PromptInput
            onSubmit={async (message) => {
              await handleSendMessage(message);
            }}
          >
            <PromptInputTextarea 
              placeholder="Type a message..." 
              className="resize-none overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{
                minHeight: '48px',
                maxHeight: '140px',
                fieldSizing: 'content'
              } as any}
            />
            <PromptInputFooter>
              <div />
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
