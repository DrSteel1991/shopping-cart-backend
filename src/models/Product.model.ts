import mongoose, { Schema } from "mongoose";
const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    images: [String],
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: String,
    stock: { type: Number, default: 0 },
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Product = mongoose.model("Product", productSchema);
