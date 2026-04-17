import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    variantId: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    isFreeShip: { type: Boolean, default: false },
    image: { type: String, default: "" },
  },
  {
    _id: false,
  },
);

const OrderSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressText: { type: String, default: "", trim: true },
    addressImage: { type: String, default: "" },
    items: { type: [OrderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "TWD" },
    voucherCode: { type: String, default: "", trim: true },
    voucherDiscount: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
