// routes/balanceSheet.js
import express from 'express';
import BalanceSheet from '../models/BalanceSheet.js';

const router = express.Router();

// GET endpoint to return all balance sheet records sorted by creation date (latest first).
router.get('/', async (req, res) => {
  try {
    const balanceSheets = await BalanceSheet.find().sort({ createdAt: -1 });
    res.json(balanceSheets);
  } catch (error) {
    console.error("Error fetching balance sheet data:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
