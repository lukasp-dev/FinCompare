import express from "express";
import Problem from "../models/Problems.js";

const router = express.Router();

// GET /api/problems
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/:id
router.get("/:id", async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) return res.status(404).json({ message: "Problem not found" });
      res.status(200).json(problem);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

export default router;
