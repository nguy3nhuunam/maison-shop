import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, default: "" },
    type: { type: String, default: "setting" },
    clientEmail: { type: String, default: "" },
    privateKey: { type: String, default: "" },
    sheetId: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
  },
  {
    versionKey: false,
  },
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
