// routes/analyzeFileUrl.js
import express from "express";
import dotenv from "dotenv";
import { createWorker } from "tesseract.js";
import { v4 as uuidv4 } from "uuid";
import BalanceSheet from "../models/BalanceSheet.js"; // Ensure this file exists and exports a valid Mongoose model

// Import the default export from the OpenAI package.
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl in request body." });
  }
  try {
    // --- 1. OCR Step ---
    console.log("Initializing OCR worker...");
    // Create and initialize the worker for English recognition.
    const worker = await createWorker("eng");

    console.log("Performing OCR on image:", fileUrl);
    const {
      data: { text: ocrText },
    } = await worker.recognize(fileUrl);
    console.log("OCR Text:\n", ocrText);
    await worker.terminate();

    // --- 2. OpenAI Analysis to Extract Balance Sheet Data ---
    const prompt = `I have received the following image URL: ${fileUrl}
Here is the OCR extracted text from the image:
\`\`\`
${ocrText}
\`\`\`

The OCR text may contain partial information for a balance sheet. 
Please extract as many numeric values as possible to fill the fields in the following 
structure. For any field where no value can be found, set it to 0. Also, set "name" 
to the name of the company (if available; otherwise, use a unique string such as a UUID) and "year" to the current year if not available. "identifier" is just 'name' and 'year' appended together.
If data is displayed for multiple years, for example if there is data for two years side by side, look at only the data for the column containing data for the MOST RECENT YEAR. Ignore the numerical data from the other, less recent year.
If the data submitted is an INCOME statement, uses these values to fill out the following variables:
{"income": number,
  "revenue": number,
  "profit": number,
  "operatingIncome": number,
  "netIncome": number,
  "interestExpense": number,
  "incomeTaxes": number,
  "depreciation": number,
  "amortization": number}
in the format below.

The required JSON structure is:

{
  "identifier": "string",
  "name": "string"
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

Please output only the JSON without any markdown formatting or code fences.`;

    // Instantiate the OpenAI client using the API key from your .env file.
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Make the API call to the OpenAI chat completion endpoint.
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Ensure you are using the correct model identifier
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that extracts balance sheet data from provided OCR text and outputs valid JSON without any markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1600,
      temperature: 0.3,
    });

    // Extract the generated message content.
    const gptResponse = completion.choices[0].message.content;
    console.log("GPT Response:\n", gptResponse);

    // Remove markdown code fences if present.
    const cleanedResponse = gptResponse
      .replace(/```(json)?/gi, "")
      .replace(/```/g, "")
      .trim();

    // --- 3. Parse the GPT Response as JSON ---
    let balanceSheetData;
    try {
      balanceSheetData = JSON.parse(cleanedResponse);
    } catch (err) {
      console.error("Error parsing GPT response as JSON:", err);
      // Attempt to extract a JSON substring if extra text is present.
      const jsonMatch = cleanedResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          balanceSheetData = JSON.parse(jsonMatch[0]);
        } catch (err2) {
          console.error("Error parsing extracted JSON:", err2);
          return res
            .status(500)
            .json({ error: "Failed to parse JSON from GPT response." });
        }
      } else {
        return res
          .status(500)
          .json({ error: "No JSON object found in GPT response." });
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

    return res.json({ balanceSheetData });
  } catch (error) {
    console.error("Error analyzing file URL:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
