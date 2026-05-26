import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationDocument extends Document {
  documentId: string;
  userId: string;
  documentType: 'Identity Proof' | 'Education Certificate' | 'Employment Proof' | 'Address Proof';
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  status: 'Uploaded' | 'Under Review' | 'Approved' | 'Rejected';
  userRemarks?: string;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationDocumentSchema = new Schema<IVerificationDocument>(
  {
    documentId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    documentType: {
      type: String,
      enum: ['Identity Proof', 'Education Certificate', 'Employment Proof', 'Address Proof'],
      required: true,
    },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileData: { type: String, required: true },
    status: {
      type: String,
      enum: ['Uploaded', 'Under Review', 'Approved', 'Rejected'],
      default: 'Uploaded',
    },
    userRemarks: { type: String },
    adminRemarks: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<IVerificationDocument>(
  'VerificationDocument',
  VerificationDocumentSchema,
);
