// routes/analyzeFileUrl.js
import express from "express";
import dotenv from "dotenv";
import { createWorker } from "tesseract.js";
import { v4 as uuidv4 } from "uuid";
import BalanceSheet from "../models/BalanceSheet.js"; // Ensure this file exists and exports a valid Mongoose model
import OpenAI from "openai";
import XLSX from "xlsx"; // For parsing Excel files

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl in request body." });
  }
  try {
    let extractedText = "";
    const lowerUrl = fileUrl.toLowerCase();

    // --- File Type Handling ---
    if (lowerUrl.endsWith(".csv")) {
      console.log("Fetching CSV file from:", fileUrl);
      const csvResponse = await fetch(fileUrl);
      if (!csvResponse.ok) {
        throw new Error("Failed to fetch CSV file.");
      }
      extractedText = await csvResponse.text();
      console.log("CSV Text:\n", extractedText);
    } else if (lowerUrl.endsWith(".xls") || lowerUrl.endsWith(".xlsx")) {
      console.log("Fetching Excel file from:", fileUrl);
      const excelResponse = await fetch(fileUrl);
      if (!excelResponse.ok) {
        throw new Error("Failed to fetch Excel file.");
      }
      // Read response as an ArrayBuffer
      const arrayBuffer = await excelResponse.arrayBuffer();
      // Parse the Excel workbook
      const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
      // Use the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert the sheet to CSV text
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      console.log("Excel file converted to CSV text:\n", csvText);
      extractedText = csvText;
    } else {
      // --- Assume Image File and Use OCR ---
      console.log("Initializing OCR worker...");
      const worker = await createWorker("eng");
      console.log("Performing OCR on image:", fileUrl);
      const { data: { text: ocrText } } = await worker.recognize(fileUrl);
      console.log("OCR Text:\n", ocrText);
      extractedText = ocrText;
      await worker.terminate();
    }

    // --- 2. OpenAI Analysis to Extract Balance Sheet Data ---
    const prompt = `
I have received a file from the following URL: ${fileUrl}
Here is the extracted text:
\`\`\`
${extractedText}
\`\`\`
The extracted text may come from either an image (via OCR) or from a CSV/Excel file.
Please extract the relevant numeric values for a balance sheet and output a JSON object that follows the structure below.
For any field where no numeric value is found, do not include that key in your JSON output.
If data for multiple dates is shown, only take the data for the most recent date.
Also, if available, extract the company name and assign it to the "name" field (if not available, use a unique identifier), and set "year" to the current year if not provided.
The "identifier" field should be the raw concatenation of "name" and "year".

If the data provided is from an income statement, also extract these fields:
{
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

Output only the JSON without any markdown formatting.

The expected JSON structure is:

{
  "identifier": "string",
  "name": "string",
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
    `.trim();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an assistant that extracts balance sheet data from provided text and outputs valid JSON without any markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1600,
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0].message.content;
    console.log("GPT Response:\n", gptResponse);

    // --- 3. Parse the GPT Response as JSON ---
    const cleanedResponse = gptResponse
      .replace(/```(json)?/gi, "")
      .replace(/```/g, "")
      .trim();

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
          return res.status(500).json({ error: "Failed to parse JSON from GPT response." });
        }
      } else {
        return res.status(500).json({ error: "No JSON object found in GPT response." });
      }
    }

    // If the parsed data is an array, select the object with the highest "year" value.
    if (Array.isArray(balanceSheetData)) {
      balanceSheetData = balanceSheetData.reduce((mostRecent, current) =>
        current.year > mostRecent.year ? current : mostRecent, balanceSheetData[0]
      );
    }

    const balanceSheetRecord = new BalanceSheet({
      fileUrl,
      ocrText: extractedText,
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
