import axios from "axios";

export const askAi = async (message) => {
  try {
    if (!message || !Array.isArray(message) || message.length === 0) {
      throw new Error("Message array is empty.");
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("AI return empty response.");
    }
    return content;
  } catch (error) {
    const errorBody = error.response?.data || error.message;
    console.error("openRouter Error:", errorBody);
    throw new Error(
      `open router API Error: ${
        typeof errorBody === "string" ? errorBody : JSON.stringify(errorBody)
      }`,
    );
  }
};
