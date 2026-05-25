import mongoose, { Document, Schema } from "mongoose";

export interface IRecord extends Document {
  recordId: string;
  userId: string;
  type:
    | "IdentityCheck"
    | "EmploymentCheck"
    | "EducationCheck"
    | "CriminalCheck";
  status: "Pending" | "InReview" | "Verified" | "Flagged";
  details: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecordSchema = new Schema<IRecord>(
  {
    recordId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "IdentityCheck",
        "EmploymentCheck",
        "EducationCheck",
        "CriminalCheck",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "InReview", "Verified", "Flagged"],
      default: "Pending",
    },
    details: { type: String, required: true },
    assignedTo: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IRecord>("Record", RecordSchema);
