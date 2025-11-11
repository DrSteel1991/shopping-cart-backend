import { Request, Response } from "express";
import {
  LoginRequestBody,
  RegisterRequestBody,
  RegisterResponse,
} from "../types/types";
import { loginUser, registerUser } from "../services/auth.service";

interface TypedRequest<T> extends Request {
  body: T;
}

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

    const result = await loginUser({ email, password });

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage === "Invalid email or password" ? 401 : 500;
    res.status(statusCode).json({ error: errorMessage });
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

    const result = await registerUser({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      errorMessage.includes("already exists") ||
      errorMessage.includes("Invalid")
        ? errorMessage.includes("already exists")
          ? 409
          : 400
        : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};
