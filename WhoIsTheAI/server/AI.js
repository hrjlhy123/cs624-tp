import "dotenv/config";
import OpenAI from "openai";

let openai = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is missing. Using fallback AI answer.");
    return null;
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openai;
}

export async function GPT(model, base64Image, message = null) {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            message && {
              type: "text",
              text: message,
            },
            base64Image && {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ].filter(Boolean),
        },
      ],
    });

    return response.choices[0];
  } catch (error) {
    console.error("Failed to process GPT:", error);
    return null;
  }
}
