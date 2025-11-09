import { Document } from "mongoose";

export interface User extends Document {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address?: Address[];
  cart?: {
    productId: any;
    quantity: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Request body types
export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  phone: string;
  address?: Address[];
}

export interface RegisterResponse {
  id?: string;
  message?: string;
  token?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
    address: Address[];
    cart?: {
      productId: string;
      quantity: number;
    }[];
  };
  error?: string;
}
