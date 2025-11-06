import mongoose, { Schema, Document } from "mongoose";

// Example interface for a document
export interface IExample extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example schema
const ExampleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Export the model
export default mongoose.model<IExample>("Example", ExampleSchema);

