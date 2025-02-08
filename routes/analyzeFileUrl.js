// analyzeFileUrl.js
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Configure OpenAI with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Analyzes a file URL by sending it to GPT.
 * @param {string} fileUrl - The URL of the file (e.g., an image) to analyze.
 */
async function analyzeFileUrl(fileUrl) {
  // Build a prompt that instructs GPT to analyze the image URL.
  // Note: GPT can't actually "see" images unless integrated with vision capabilities.
  // This prompt instructs GPT to provide an analysis or commentary based on the URL.
  const prompt = `I have received the following image URL: ${fileUrl}
Please provide a summary or commentary on what this image might depict based on the URL and any available context. 
If the image cannot be analyzed directly, explain what further information might be needed.`;

  try {
    // Use the Chat Completion API with gpt-3.5-turbo
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that can analyze and comment on provided context." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const gptResponse = completion.data.choices[0].message.content;
    console.log("GPT Analysis:\n", gptResponse);
  } catch (error) {
    console.error("Error analyzing file URL:", error);
  }
}

// Replace this URL with the one you received
const fileUrl = "https://uga-hack.s3.us-east-2.amazonaws.com/284c59a0-8e2d-44bc-baa8-d4c9958d5579.png";

// Call the function to analyze the file URL
analyzeFileUrl(fileUrl);
