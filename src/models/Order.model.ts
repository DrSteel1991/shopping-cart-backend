import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        // Variant information for size and color
        size: {
          type: String,
          enum: ["256GB", "512GB", "1TB"],
        },
        color: {
          type: String,
          enum: ["black", "gold", "silver", "blue"],
        },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      country: String,
      postalCode: String,
    },
    paymentMethod: { type: String, enum: ["card", "cash_on_delivery"] },
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
