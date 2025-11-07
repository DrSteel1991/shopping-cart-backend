import { Document } from "mongoose";

export interface User extends Document {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

