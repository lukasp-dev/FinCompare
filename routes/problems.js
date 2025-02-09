import express from "express";
import Problem from "../models/Problems.js";

const router = express.Router();

// Helper function to randomly select `count` items from an array
const getRandomItems = (array, count) => {
  if (!array || array.length === 0) return [];
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// GET /api/problems/random?type=1
router.get("/random", async (req, res) => {
  const { type } = req.query;

  try {
    if (!type) {
      return res.status(400).json({ message: "Type parameter is required" });
    }

    const problemData = await Problem.findOne({ type: parseInt(type) });

    if (!problemData) {
      return res.status(404).json({ message: "No problems found for the given type" });
    }

    const { definition, judgement, calculation } = problemData.questions;

    const selectedDefinition = getRandomItems(definition, 3);
    const selectedJudgement = getRandomItems(judgement, 3);
    const selectedCalculation = getRandomItems(calculation, 3);

    let selectedQuestions = [...selectedDefinition, ...selectedJudgement, ...selectedCalculation];
    if (definition.length > 3) {
      selectedQuestions.push(getRandomItems(definition, 1)[0]);
    }

    selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

    res.status(200).json(selectedQuestions);
  } catch (err) {
    console.error("Error fetching random problems:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
