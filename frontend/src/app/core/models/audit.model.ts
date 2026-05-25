export interface AuditLog {
  _id: string;
  action: string;
  performedBy: string;
  targetUserId: string;
  details: string;
  timestamp: string;
}