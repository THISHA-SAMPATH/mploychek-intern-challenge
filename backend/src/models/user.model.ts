import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: "GeneralUser" | "Admin";
  department: string;
  verificationStatus: "Pending" | "InReview" | "Verified" | "Flagged";
  isActive: boolean;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["GeneralUser", "Admin"],
      default: "GeneralUser",
    },
    department: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["Pending", "InReview", "Verified", "Flagged"],
      default: "Pending",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Hash password before saving
// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
