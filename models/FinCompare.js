// models/FinCompare.js
import mongoose from "mongoose";

const FinCompareSchema = new mongoose.Schema({
  type: {
    type: Number,
    required: true,
  },
  problems: {
    definition: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    judgement: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    calculation: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
});

const FinCompare = mongoose.model("finCompare", FinCompareSchema);

export default FinCompare;
