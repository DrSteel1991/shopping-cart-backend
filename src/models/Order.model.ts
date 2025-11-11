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
        variant: {
          size: {
            type: String,
            enum: ["256GB", "512GB", "1TB"],
          },
          color: {
            type: String,
            enum: ["black", "gold", "silver", "blue"],
          },
          name: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          available: {
            type: Boolean,
            required: true,
          },
          stock: {
            type: Number,
            required: true,
          },
          sku: {
            type: String,
            required: true,
          },
          required: false,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
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
