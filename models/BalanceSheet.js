// models/BalanceSheet.js
import mongoose from "mongoose";

const BalanceSheetSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    ocrText: { type: String, required: true },
    balanceSheetData: { type: mongoose.Schema.Types.Mixed, required: true },
  },
);

const BalanceSheet = mongoose.model("BalanceSheet", BalanceSheetSchema);

export default BalanceSheet;
