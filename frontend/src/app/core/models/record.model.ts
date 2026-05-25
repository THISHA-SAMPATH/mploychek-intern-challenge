export type RecordType = 'IdentityCheck' | 'EmploymentCheck' | 'EducationCheck' | 'CriminalCheck';
export type RecordStatus = 'Pending' | 'InReview' | 'Verified' | 'Flagged';

export interface Record {
  _id: string;
  recordId: string;
  userId: string;
  type: RecordType;
  status: RecordStatus;
  details: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordsResponse {
  count: number;
  delay: number;
  records: Record[];
}