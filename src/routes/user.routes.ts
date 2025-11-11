import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    message: "This is a protected route",
    user: {
      userId: req.userId,
      email: req.userEmail,
      role: req.userRole,
    },
  });
});

export default router;
