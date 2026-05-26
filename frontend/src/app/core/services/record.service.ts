import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordsResponse } from '../models/record.model';
import { AuditLog } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getRecords(delay: number = 0): Observable<RecordsResponse> {
    return this.http.get<RecordsResponse>(
      `${this.apiUrl}/records?delay=${delay}`
    );
  }

  updateRecordStatus(recordId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/records/${recordId}/status`, { status });
  }

  getAuditLogs(): Observable<{ count: number; logs: AuditLog[] }> {
    return this.http.get<{ count: number; logs: AuditLog[] }>(
      `${this.apiUrl}/records/audit/logs`
    );
  }
}
