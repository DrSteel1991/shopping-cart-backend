import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/users.model";
import {
  LoginRequestBody,
  RegisterRequestBody,
  RegisterResponse,
} from "../types/types";
import { validateAddressArray } from "../validators/address.validator";

// Typed Request interface
interface TypedRequest<T> extends Request {
  body: T;
}

const JWT_SECRET: string =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export const login = async (
  req: TypedRequest<LoginRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { userId: String(user._id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const register = async (
  req: TypedRequest<RegisterRequestBody>,
  res: Response<RegisterResponse>
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role, phone, address } =
      req.body;

    if (!firstName || !lastName || !email || !password || !phone || !address) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Validate address array
    const addressValidation = validateAddressArray(address);
    if (!addressValidation.isValid) {
      res.status(400).json({ error: addressValidation.error });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
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

    res.status(201).json({
      message: "User registered successfully",
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
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
