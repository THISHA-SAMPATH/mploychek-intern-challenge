import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DocumentsResponse,
  UploadDocumentPayload,
  VerificationDocument,
  DocumentStatus,
} from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = 'https://mploychek-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<DocumentsResponse> {
    return this.http.get<DocumentsResponse>(`${this.apiUrl}/documents`);
  }

  getDocument(documentId: string): Observable<VerificationDocument> {
    return this.http.get<VerificationDocument>(`${this.apiUrl}/documents/${documentId}`);
  }

  uploadDocument(payload: UploadDocumentPayload): Observable<{
    message: string;
    document: VerificationDocument;
  }> {
    return this.http.post<{ message: string; document: VerificationDocument }>(
      `${this.apiUrl}/documents`,
      payload
    );
  }

  reviewDocument(
    documentId: string,
    status: DocumentStatus,
    adminRemarks: string
  ): Observable<{ message: string; document: VerificationDocument }> {
    return this.http.put<{ message: string; document: VerificationDocument }>(
      `${this.apiUrl}/documents/${documentId}/review`,
      { status, adminRemarks }
    );
  }
}
