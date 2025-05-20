import 'dotenv/config';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GPT(model, base64Image, message = null) {
  console.log(`message:`, message)
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: `user`,
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
    const result_GPT = response.choices[0];
    console.log(`result_GPT: ${JSON.stringify(result_GPT)}`);
    return result_GPT;
  } catch (error) {
    console.log(`Failed to process GPT: ${error}`);
  }
}

