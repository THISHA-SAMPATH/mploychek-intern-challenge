import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { RecordService } from '../../../core/services/record.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentService } from '../../../core/services/document.service';
import { Record as VerificationRecord } from '../../../core/models/record.model';
import {
  DocumentType,
  UploadDocumentPayload,
  VerificationDocument,
} from '../../../core/models/document.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  records = signal<VerificationRecord[]>([]);
  documents = signal<VerificationDocument[]>([]);
  isLoading = signal(false);
  isUploading = signal(false);
  delay = signal(0);
  displayedColumns = ['recordId', 'type', 'status', 'details', 'createdAt'];
  documentTypes: DocumentType[] = [
    'Identity Proof',
    'Education Certificate',
    'Employment Proof',
    'Address Proof',
  ];
  selectedDocumentType: DocumentType = 'Identity Proof';
  selectedFile: File | null = null;
  userRemarks = '';
  skeletonCards = [1, 2, 3, 4];
  skeletonRows = [1, 2, 3, 4, 5];

  stats = signal({ total: 0, verified: 0, pending: 0, flagged: 0 });

  constructor(
    public authService: AuthService,
    private recordService: RecordService,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadRecords();
    this.loadDocuments();
  }

  loadRecords(): void {
    this.isLoading.set(true);
    this.recordService.getRecords(this.delay()).subscribe({
      next: (res) => {
        this.records.set(res.records);
        this.stats.set({
          total: res.records.length,
          verified: res.records.filter((r) => r.status === 'Verified').length,
          pending: res.records.filter((r) => r.status === 'Pending').length,
          flagged: res.records.filter((r) => r.status === 'Flagged').length,
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setDelay(delay: number): void {
    this.delay.set(delay);
    this.loadRecords();
  }

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (res) => this.documents.set(res.documents),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Choose a document file first', 'Close', { duration: 3000 });
      return;
    }

    if (this.selectedFile.size > 5 * 1024 * 1024) {
      this.snackBar.open('File must be 5MB or less', 'Close', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    this.isUploading.set(true);
    reader.onload = () => {
      const payload: UploadDocumentPayload = {
        documentType: this.selectedDocumentType,
        fileName: this.selectedFile!.name,
        fileType: this.selectedFile!.type || 'application/octet-stream',
        fileSize: this.selectedFile!.size,
        fileData: String(reader.result),
        userRemarks: this.userRemarks,
      };

      this.documentService.uploadDocument(payload).subscribe({
        next: () => {
          this.isUploading.set(false);
          this.selectedFile = null;
          this.userRemarks = '';
          this.loadDocuments();
          this.snackBar.open('Document uploaded for admin review', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.isUploading.set(false);
          this.snackBar.open(err.error?.message || 'Upload failed', 'Close', { duration: 3000 });
        },
      });
    };
    reader.onerror = () => {
      this.isUploading.set(false);
      this.snackBar.open('Could not read selected file', 'Close', { duration: 3000 });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      Verified: 'primary',
      Pending: 'primary',
      InReview: 'warn',
      Flagged: 'warn',
    };
    return colors[status] || 'default';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Verified: 'check_circle',
      Pending: 'schedule',
      InReview: 'sync',
      Flagged: 'flag',
    };
    return icons[status] || 'help';
  }

  getDocumentStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Uploaded: 'upload_file',
      'Under Review': 'rate_review',
      Approved: 'verified',
      Rejected: 'cancel',
    };
    return icons[status] || 'description';
  }
}
