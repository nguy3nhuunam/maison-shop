import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
  },
  {
    _id: false,
  },
);

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
  },
);

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, enum: ["nam", "nu"], required: true },
    tags: { type: [String], default: [] },
    genderType: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "female",
    },
    isOversize: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    isFreeShip: { type: Boolean, default: false },
    variants: { type: [VariantSchema], default: [] },
    reviews: { type: [ReviewSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
