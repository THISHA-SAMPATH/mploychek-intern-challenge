import { Router, Request, Response } from 'express';
import seedData from '../config/seed';
import AuditLog from '../models/auditlog.model';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/demo',
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await seedData();

      await AuditLog.create({
        action: 'RESTORE_DEMO_DATA',
        performedBy: req.user!.userId,
        targetUserId: req.user!.userId,
        details: `Admin ${req.user!.name} restored demo users and verification records`,
      });

      res.status(200).json({
        message: 'Demo users and records restored successfully',
        result,
      });
    } catch (error) {
      res.status(500).json({ message: 'Unable to restore demo data', error });
    }
  },
);

export default router;
