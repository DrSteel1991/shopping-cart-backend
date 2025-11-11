import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/users.model";
import { LoginRequestBody, RegisterRequestBody } from "../types/types";
import { validateAddressArray } from "../validators/address.validator";

const JWT_SECRET: string =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export interface LoginResult {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
  };
}

export interface RegisterResult {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
    address: Array<{
      street: string;
      city: string;
      country: string;
      postalCode: string;
    }>;
    cart?: Array<{
      productId: string;
      quantity: number;
    }>;
  };
}

export const loginUser = async (
  loginData: LoginRequestBody
): Promise<LoginResult> => {
  const { email, password } = loginData;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: String(user._id), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: String(user._id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  };
};

export const registerUser = async (
  registerData: RegisterRequestBody
): Promise<RegisterResult> => {
  const { firstName, lastName, email, password, role, phone, address } =
    registerData;

  const addressValidation = validateAddressArray(address);
  if (!addressValidation.isValid) {
    throw new Error(addressValidation.error || "Invalid address");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || "user",
    phone,
    address: addressValidation.addressArray,
  });

  await user.save();

  const token = jwt.sign(
    { userId: String(user._id), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user._id?.toString() || "",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address || [],
      cart: user.cart || [],
    },
  };
};
