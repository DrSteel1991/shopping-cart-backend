import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: String,
});

export const Category = mongoose.model("Category", categorySchema);
