import mongoose from "mongoose";

const FomoSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ["sales", "stock", "custom"], default: "custom" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export default mongoose.models.Fomo || mongoose.model("Fomo", FomoSchema);
