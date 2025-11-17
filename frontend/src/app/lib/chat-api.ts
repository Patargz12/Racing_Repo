import axios from "axios";

// Get the API URL from environment variable or use localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Send a chat message to the backend (with optional files)
 * @param question - The user's question
 * @param files - Optional array of files to upload
 * @returns Promise with the bot's answer
 */
export async function sendChatMessage(
  question: string,
  files?: File[]
): Promise<string> {
  try {
    // Create FormData to handle both text and files
    const formData = new FormData();
    
    // Always add the question field (even if empty) for multipart/form-data
    formData.append("question", question || "");

    // Add the first file (we'll use single file for now, can be extended to multiple)
    if (files && files.length > 0) {
      formData.append("file", files[0]);
    }

    const response = await axios.post(`${API_URL}/chat`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success && response.data.answer) {
      return response.data.answer;
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to get response";
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Get sample questions from the backend
 * @returns Promise with array of sample questions
 */
export async function getSampleQuestions(): Promise<string[]> {
    try {
        const response = await axios.get(`${API_URL}/sample-questions`);

        if (response.data.success && response.data.questions) {
            return response.data.questions;
        } else {
            // Return default questions if API fails
            return [
                "What is Toyota Gazoo Racing?",
                "Tell me about Toyota's racing history",
                "What racing series does Toyota compete in?",
            ];
        }
    } catch (error) {
        console.error("Failed to fetch sample questions:", error);
        // Return default questions if API fails
        return [
            "What is Toyota Gazoo Racing?",
            "Tell me about Toyota's racing history",
            "What racing series does Toyota compete in?",
        ];
    }
}
