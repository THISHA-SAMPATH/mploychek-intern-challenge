import { Router, Request, Response } from 'express';
import VerificationDocument from '../models/document.model';
import AuditLog from '../models/auditlog.model';
import User from '../models/user.model';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

const validTypes = [
  'Identity Proof',
  'Education Certificate',
  'Employment Proof',
  'Address Proof',
];

const validReviewStatuses = ['Under Review', 'Approved', 'Rejected'];

const createDocumentId = (): string =>
  `DOC${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

const serializeDocument = (doc: any, includeFile = false) => {
  const output = {
    documentId: doc.documentId,
    userId: doc.userId,
    documentType: doc.documentType,
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    status: doc.status,
    userRemarks: doc.userRemarks,
    adminRemarks: doc.adminRemarks,
    reviewedBy: doc.reviewedBy,
    reviewedAt: doc.reviewedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return includeFile ? { ...output, fileData: doc.fileData } : output;
};

router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.user!.role === 'Admin' ? {} : { userId: req.user!.userId };
    const documents = await VerificationDocument.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      count: documents.length,
      documents: documents.map((doc) => serializeDocument(doc)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get(
  '/:documentId',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const document = await VerificationDocument.findOne({
        documentId: req.params.documentId,
      });

      if (!document) {
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      if (req.user!.role !== 'Admin' && document.userId !== req.user!.userId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      res.status(200).json(serializeDocument(document, true));
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },
);

router.post('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType, fileName, fileType, fileSize, fileData, userRemarks } = req.body;

    if (!documentType || !fileName || !fileType || !fileSize || !fileData) {
      res.status(400).json({ message: 'Document type and file are required' });
      return;
    }

    if (!validTypes.includes(documentType)) {
      res.status(400).json({ message: 'Invalid document type' });
      return;
    }

    if (Number(fileSize) > 5 * 1024 * 1024) {
      res.status(400).json({ message: 'File size must be 5MB or less' });
      return;
    }

    const document = await VerificationDocument.create({
      documentId: createDocumentId(),
      userId: req.user!.userId,
      documentType,
      fileName,
      fileType,
      fileSize: Number(fileSize),
      fileData,
      status: 'Uploaded',
      userRemarks,
    });

    await AuditLog.create({
      action: 'UPLOAD_DOCUMENT',
      performedBy: req.user!.userId,
      targetUserId: req.user!.userId,
      details: `${req.user!.name} uploaded ${documentType}`,
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: serializeDocument(document),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put(
  '/:documentId/review',
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, adminRemarks } = req.body;

      if (!validReviewStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid review status' });
        return;
      }

      const document = await VerificationDocument.findOneAndUpdate(
        { documentId: req.params.documentId },
        {
          status,
          adminRemarks,
          reviewedBy: req.user!.userId,
          reviewedAt: new Date(),
        },
        { new: true },
      );

      if (!document) {
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      const userDocuments = await VerificationDocument.find({ userId: document.userId });
      if (userDocuments.some((doc) => doc.status === 'Rejected')) {
        await User.findOneAndUpdate(
          { userId: document.userId },
          { verificationStatus: 'Flagged' },
        );
      } else if (
        userDocuments.length >= 4 &&
        userDocuments.every((doc) => doc.status === 'Approved')
      ) {
        await User.findOneAndUpdate(
          { userId: document.userId },
          { verificationStatus: 'Verified' },
        );
      } else {
        await User.findOneAndUpdate(
          { userId: document.userId },
          { verificationStatus: 'InReview' },
        );
      }

      await AuditLog.create({
        action: 'REVIEW_DOCUMENT',
        performedBy: req.user!.userId,
        targetUserId: document.userId,
        details: `Admin ${req.user!.name} marked ${document.documentType} as ${status}`,
      });

      res.status(200).json({
        message: 'Document reviewed successfully',
        document: serializeDocument(document),
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },
);

export default router;
