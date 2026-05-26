import { Router, Request, Response } from "express";
import User from "../models/user.model";
import AuditLog from "../models/auditlog.model";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

const normalizeRole = (role: string | undefined): "Admin" | "GeneralUser" => {
  if (role === "Admin") return "Admin";
  return "GeneralUser";
};

// GET /api/users — Admin: get all users
router.get(
  "/",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

// GET /api/users/me — Get own profile
router.get(
  "/me",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        userId: req.user!.userId,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        department: req.user!.department,
        verificationStatus: req.user!.verificationStatus,
        isActive: req.user!.isActive,
        createdAt: req.user!.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

// POST /api/users — Admin: create user
router.post(
  "/",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, name, email, password, role, department } = req.body;

      const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
      if (existingUser) {
        res
          .status(400)
          .json({ message: "User with this ID or email already exists" });
        return;
      }

      const user = await User.create({
        userId,
        name,
        email,
        password,
        role: normalizeRole(role),
        department,
        verificationStatus: "Pending",
        isActive: true,
      });

      await AuditLog.create({
        action: "CREATE_USER",
        performedBy: String(req.user!.userId),
        targetUserId: String(userId),
        details: `Admin ${req.user!.name} created user ${name}`,
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

// PUT /api/users/:userId — Admin: update user
router.put(
  "/:userId",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { name, email, role, department, verificationStatus, isActive } =
        req.body;

      const user = await User.findOneAndUpdate(
        { userId },
        { name, email, role, department, verificationStatus, isActive },
        { new: true, runValidators: true },
      ).select("-password");

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await AuditLog.create({
        action: "UPDATE_USER",
        performedBy: String(req.user!.userId),
        targetUserId: String(userId),
        details: `Admin ${req.user!.name} updated user ${user.name}`,
      });

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

// DELETE /api/users/:userId — Admin: deactivate user
router.delete(
  "/:userId",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await User.findOneAndUpdate(
        { userId },
        { isActive: false },
        { new: true },
      ).select("-password");

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await AuditLog.create({
        action: "DEACTIVATE_USER",
        performedBy: String(req.user!.userId),
        targetUserId: String(userId),
        details: `Admin ${req.user!.name} deactivated user ${user.name}`,
      });

      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

export default router;
