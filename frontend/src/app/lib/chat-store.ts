import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatStore {
  messages: Message[];
  sessionId: string | null;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  removeLastMessage: () => void;
  clearMessages: () => void;
  getOrCreateSessionId: () => string;
  clearSession: () => void;
}

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      sessionId: null,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ],
        })),

      removeLastMessage: () =>
        set((state) => ({
          messages: state.messages.slice(0, -1),
        })),

      clearMessages: () => set({ messages: [] }),

      getOrCreateSessionId: () => {
        const currentSessionId = get().sessionId;
        if (currentSessionId) {
          return currentSessionId;
        }
        const newSessionId = generateSessionId();
        set({ sessionId: newSessionId });
        return newSessionId;
      },

      clearSession: () => {
        const newSessionId = generateSessionId();
        set({ 
          messages: [], 
          sessionId: newSessionId 
        });
      },
    }),
    {
      name: "toyota-chat-storage",
      partialize: (state) => ({ 
        sessionId: state.sessionId,
        // Don't persist messages to avoid stale data
      }),
    }
  )
);
