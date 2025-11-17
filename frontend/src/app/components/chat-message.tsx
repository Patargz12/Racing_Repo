"use client";

import type { Message } from "@/app/lib/chat-store";
import {
  Message as AIMessage,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { RacingLoader } from "@/app/components/custom/RacingLoader";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  message: Message;
  onCopy?: (text: string) => void;
}

// Custom hook for typing animation
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

export function ChatMessage({ message, onCopy }: ChatMessageProps) {
  const isUser = message.sender === "user";
  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Use typing animation for bot messages (ChatGPT-like speed)
  const { displayedText } = useTypingAnimation(
    isUser ? "" : message.content,
    15, // 15ms interval
    5 // 5 characters per interval = very fast like ChatGPT
  );

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? "U" : "T"}
      </div>

      {/* Message Bubble */}
      <div
        className={`flex flex-col gap-2 max-w-full ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-lg ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground border border-border"
          } ${message.isLoading ? "opacity-75" : ""}`}
        >
          {message.isLoading ? (
            <RacingLoader />
          ) : isUser ? (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <AIMessage from="assistant">
              <MessageContent>
                <MessageResponse>{displayedText}</MessageResponse>
              </MessageContent>
            </AIMessage>
          )}
        </div>

        {/* Timestamp and Copy Button */}
        <div className="flex gap-2 items-center px-2">
          <span className="text-xs text-muted-foreground">{timeStr}</span>
          {!message.isLoading && !isUser && (
            <button
              onClick={() => onCopy?.(message.content)}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Copy message"
              title="Copy message"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
