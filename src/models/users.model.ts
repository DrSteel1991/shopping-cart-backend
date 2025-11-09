import mongoose, { Schema } from "mongoose";
import { User } from "../types/types";

const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
});

const userSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: { type: String, unique: true, required: true, index: true },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      role: { type: String, enum: ["user", "admin"], default: "user" },
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: [addressSchema],
    cart: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<User>("User", userSchema);
