// analyzeFileUrl.js
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import { createWorker } from "tesseract.js";
import { v4 as uuidv4 } from "uuid";
import BalanceSheet from "./models/BalanceSheet.js"; // Adjust the path if necessary

dotenv.config();

// Configure OpenAI with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Analyzes a file URL by:
 *  1. Running OCR on the image.
 *  2. Sending the OCR text along with instructions to extract balance sheet data to ChatGPT.
 *  3. Parsing the GPT response (expected to be valid JSON) and storing the resulting data in the database.
 *
 * @param {string} fileUrl - The HTTPS URL of the file (e.g., an image) to analyze.
 * @returns {Promise<Object>} The stored balance sheet record.
 */
async function analyzeFileUrl(fileUrl) {
  try {
    // --- 1. OCR Step ---
    const worker = createWorker();
    console.log("Initializing OCR worker...");
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    console.log("Performing OCR on image:", fileUrl);
    const {
      data: { text: ocrText },
    } = await worker.recognize(fileUrl);
    console.log("OCR Text:\n", ocrText);
    await worker.terminate();

    // --- 2. OpenAI Analysis to Extract Balance Sheet Data ---
    // Construct a prompt that instructs GPT to return only a JSON object with balance sheet data.
    const currentYear = new Date().getFullYear();
    const uniqueId = uuidv4();
    const prompt = `I have received the following image URL: ${fileUrl}
Here is the OCR extracted text from the image:
\`\`\`
${ocrText}
\`\`\`

The OCR text may contain partial information for a balance sheet. Please extract as many numeric values as possible to fill the fields in the following structure. For any field where no value can be found, set it to 0. Also, set "id" to a unique string (for example, a UUID) and "year" to the current year if not available.

The required JSON structure is:

{
  "id": "string",
  "year": number,
  "assets": {
    "current": {
      "Cash and cash equivalents": number,
      "Receivables, net": number,
      "Inventories": number,
      "Etc.": number
    },
    "nonCurrent": {
      "Property and equipment, net": number,
      "Goodwill": number,
      "Long-term lease assets": number,
      "Etc.": number
    }
  },
  "liabilities": {
    "current": {
      "Short-term borrowings": number,
      "Accounts payable": number,
      "Accrued liabilities": number,
      "Etc.": number
    },
    "longTerm": {
      "Long-term debt": number,
      "Deferred income taxes": number,
      "Finance & operating lease obligations": number,
      "Etc.": number
    }
  },
  "equity": {
    "common": {
      "Common stock": number,
      "Capital in excess of par value": number,
      "Retained earnings": number,
      "Etc.": number
    },
    "comprehensive": {
      "Foreign currency translation adjustments": number,
      "Unrealized gains/losses on securities": number,
      "Etc.": number
    }
  },
  "income": number,
  "revenue": number,
  "profit": number,
  "operatingIncome": number,
  "netIncome": number,
  "interestExpense": number,
  "incomeTaxes": number,
  "depreciation": number,
  "amortization": number
}

Please analyze the OCR text above and output **only** the JSON object (with no additional commentary) that exactly matches the structure above.`;
    
    console.log("Sending prompt to OpenAI...");
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that extracts balance sheet data from provided OCR text and outputs valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const gptResponse = completion.data.choices[0].message.content;
    console.log("GPT Response:\n", gptResponse);

    // --- 3. Parse the GPT Response as JSON ---
    let balanceSheetData;
    try {
      balanceSheetData = JSON.parse(gptResponse);
    } catch (err) {
      console.error("Error parsing GPT response as JSON:", err);
      // Try to extract the JSON substring in case there is extra text.
      const jsonMatch = gptResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          balanceSheetData = JSON.parse(jsonMatch[0]);
        } catch (err2) {
          console.error("Error parsing extracted JSON:", err2);
          throw new Error("Failed to parse JSON from GPT response.");
        }
      } else {
        throw new Error("No JSON object found in GPT response.");
      }
    }

    // --- 4. Save the Results in the Database ---
    const balanceSheetRecord = new BalanceSheet({
      fileUrl,
      ocrText,
      balanceSheetData,
    });
    await balanceSheetRecord.save();
    console.log("Balance sheet record saved:", balanceSheetRecord);

    return balanceSheetRecord;
  } catch (error) {
    console.error("Error analyzing file URL:", error);
    throw error;
  }
}

// Replace this URL with the one you received or want to test.
const fileUrl =
  "https://uga-hack.s3.us-east-2.amazonaws.com/284c59a0-8e2d-44bc-baa8-d4c9958d5579.png";

// Call the function to analyze the file URL.
analyzeFileUrl(fileUrl)
  .then((record) => {
    console.log("Final record:", record);
  })
  .catch((err) => {
    console.error("Analysis failed:", err);
  });
