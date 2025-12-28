import { ENV } from "./env";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMResponse = {
  content: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Invoke the LLM (Language Model) with messages.
 * Uses Google Gemini API via OpenAI-compatible endpoint.
 */
export async function invokeLLM(params: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}): Promise<LLMResponse> {
  const apiKey = ENV.geminiApiKey;
  
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.max_tokens ?? 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[LLM] API Error:", errorData);
      throw new Error(`LLM invoke failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from LLM API");
    }

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("[LLM] Error:", error.message);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    throw error;
  }
}
