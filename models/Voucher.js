import mongoose from "mongoose";

const VoucherSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    isActive: { type: Boolean, default: true },
    maxUsage: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export default mongoose.models.Voucher || mongoose.model("Voucher", VoucherSchema);
