import { create } from "zustand"

export interface Message {
    id: string
    content: string
    sender: "user" | "bot"
    timestamp: Date
    isLoading?: boolean
}

interface ChatStore {
    messages: Message[]
    addMessage: (message: Omit<Message, "id" | "timestamp">) => void
    removeLastMessage: () => void
    clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
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
}))
