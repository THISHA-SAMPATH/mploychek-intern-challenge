export type Role = 'Admin' | 'GeneralUser';
export type VerificationStatus = 'Pending' | 'InReview' | 'Verified' | 'Flagged';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  userId: string;
  password: string;
  role: Role;
}
