import express from "express";
import Problem from "../models/Problems.js";

const router = express.Router();

// 랜덤으로 문제 선택 및 카테고리 포함
const getRandomItemsWithCategory = (array, count, category) => {
  if (!Array.isArray(array) || array.length === 0) return [];
  return array
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, array.length))
    .map((item) => ({ ...item, category })); // toObject() 제거
};

router.get("/random", async (req, res) => {
  const { type } = req.query;

  try {
    if (!type) {
      return res.status(400).json({ message: "Type parameter is required" });
    }

    // MongoDB에서 `type`이 일치하는 문제집을 랜덤으로 하나 선택
    const problemData = await Problem.aggregate([
      { $match: { type: parseInt(type) } },
      { $sample: { size: 1 } } // 문제집 하나만 랜덤 선택
    ]);

    if (!problemData.length) {
      return res.status(404).json({ message: "No problems found for the given type" });
    }

    const { 
      questions: { 
        definition = [], 
        judgement = [], 
        calculation = [] 
      } = {} 
    } = problemData[0];

    // 카테고리별로 무작위 문제 선택
    const selectedDefinition = getRandomItemsWithCategory(definition, 4, "definition");
    const selectedJudgement = getRandomItemsWithCategory(judgement, 3, "judgement");
    const selectedCalculation = getRandomItemsWithCategory(calculation, 3, "calculation");

    // 모든 문제를 합치고 랜덤하게 섞기
    let selectedQuestions = [...selectedDefinition, ...selectedJudgement, ...selectedCalculation];
    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    res.status(200).json(selectedQuestions);
  } catch (err) {
    console.error("Error fetching random problems:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
