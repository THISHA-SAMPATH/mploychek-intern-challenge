export type DocumentType =
  | 'Identity Proof'
  | 'Education Certificate'
  | 'Employment Proof'
  | 'Address Proof';

export type DocumentStatus = 'Uploaded' | 'Under Review' | 'Approved' | 'Rejected';

export interface VerificationDocument {
  documentId: string;
  userId: string;
  documentType: DocumentType;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData?: string;
  status: DocumentStatus;
  userRemarks?: string;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsResponse {
  count: number;
  documents: VerificationDocument[];
}

export interface UploadDocumentPayload {
  documentType: DocumentType;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  userRemarks?: string;
}
