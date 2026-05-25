import { Router, Request, Response } from "express";
import Record from "../models/record.model";
import AuditLog from "../models/auditlog.model";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// GET /api/records — Get records (admin sees all, user sees own)
router.get("/", protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const delay = parseInt(req.query["delay"] as string) || 0;

    // Simulate async processing delay
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const query =
      req.user!.role === "Admin" ? {} : { userId: req.user!.userId };

    const records = await Record.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      count: records.length,
      delay: delay,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// GET /api/records/:recordId — Get single record
router.get(
  "/:recordId",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordId } = req.params;

      const record = await Record.findOne({ recordId });

      if (!record) {
        res.status(404).json({ message: "Record not found" });
        return;
      }

      // General users can only see their own records
      if (req.user!.role !== "Admin" && record.userId !== req.user!.userId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.status(200).json(record);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

// PUT /api/records/:recordId/status — Admin: update verification status
router.put(
  "/:recordId/status",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordId } = req.params;
      const { status } = req.body;

      const validStatuses = ["Pending", "InReview", "Verified", "Flagged"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid status value" });
        return;
      }

      const record = await Record.findOneAndUpdate(
        { recordId },
        { status },
        { new: true },
      );

      if (!record) {
        res.status(404).json({ message: "Record not found" });
        return;
      }

      await AuditLog.create({
        action: "UPDATE_RECORD_STATUS",
        performedBy: req.user!.userId,
        targetUserId: record.userId,
        details: `Admin ${req.user!.name} updated record ${recordId} status to ${status}`,
      });

      res.status(200).json({ message: "Status updated successfully", record });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

// GET /api/records/audit/logs — Admin: get audit logs
router.get(
  "/audit/logs",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
      res.status(200).json({ count: logs.length, logs });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
);

export default router;
