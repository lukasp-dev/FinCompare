import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question_id: { type: Number, required: true },
  question_text: { type: String, required: true },
  options: { type: [String], required: true },
  correct_option: { type: Number, required: true },
  picture_url: { type: String, default: null },
});

const ProblemSchema = new mongoose.Schema({
  question_id: { type: Number, required: true },
  template: { type: String, required: true },
  variables: {
    current_assets: { type: [Number], required: true },
    current_liabilities: { type: [Number], required: true },
  },
  formula: { type: String, required: true },
  picture_url: { type: String, default: null },
});

const CalculationSchema = new mongoose.Schema({
  has_variable: { type: Boolean, required: true },
  problems: { type: [ProblemSchema], required: true },
});

const ProblemsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  concept: { type: String, required: true },
  questions: {
    definition: { type: [QuestionSchema], required: true },
    interpretation: { type: [QuestionSchema], required: true },
    calculation: { type: CalculationSchema, required: true },
  },
});

export default mongoose.model("Problems", ProblemsSchema);
