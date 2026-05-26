import { Router, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/user.model";
import AuditLog from "../models/auditlog.model";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, password, role } = req.body;

    if (!userId || !password || !role) {
      res
        .status(400)
        .json({ message: "userId, password and role are required" });
      return;
    }

    if (!["Admin", "GeneralUser"].includes(role)) {
      res.status(400).json({ message: "Invalid role selected" });
      return;
    }

    const user = await User.findOne({ userId });

    if (!user || !user.isActive) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (user.role !== role) {
      res.status(403).json({ message: "Selected role does not match this user" });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions,
    );

    const refreshToken = jwt.sign(
      { userId: user.userId },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } as SignOptions,
    );

    // Log the login action
    await AuditLog.create({
      action: "LOGIN",
      performedBy: user.userId,
      targetUserId: user.userId,
      details: `User ${user.name} logged in`,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token required" });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { userId: string };

    const user = await User.findOne({ userId: decoded.userId });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions,
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
