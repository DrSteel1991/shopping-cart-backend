import express, { Request, Response } from "express";
import { connectDatabase } from "./config/database";

const app = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Shopping Cart Backend API" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
