import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { RecordService } from '../../../core/services/record.service';
import { User } from '../../../core/models/user.model';
import { AuditLog } from '../../../core/models/audit.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  users = signal<User[]>([]);
  auditLogs = signal<AuditLog[]>([]);
  isLoading = signal(false);
  isCreating = signal(false);
  showCreateForm = signal(false);

  userColumns = ['userId', 'name', 'email', 'role', 'department', 'status', 'active', 'actions'];
  auditColumns = ['timestamp', 'action', 'performedBy', 'targetUserId', 'details'];

  createForm: FormGroup;

  constructor(
    private userService: UserService,
    private recordService: RecordService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['GeneralUser', Validators.required],
      department: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAuditLogs();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => { this.users.set(users); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  loadAuditLogs(): void {
    this.recordService.getAuditLogs().subscribe({
      next: (res) => this.auditLogs.set(res.logs),
    });
  }

  createUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.snackBar.open('Please complete all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isCreating.set(true);
    this.userService.createUser(this.createForm.value).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.createForm.reset({ role: 'GeneralUser' });
        this.showCreateForm.set(false);
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: (err) => {
        this.isCreating.set(false);
        this.snackBar.open(err.error?.message || 'Failed to create user', 'Close', { duration: 3000 });
      },
    });
  }

  updateStatus(userId: string, verificationStatus: string): void {
    this.userService.updateUser(userId, { verificationStatus: verificationStatus as any }).subscribe({
      next: () => {
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
        this.loadUsers();
        this.loadAuditLogs();
      },
    });
  }

  deactivateUser(userId: string): void {
    if (!confirm('Deactivate this user?')) return;
    this.userService.deactivateUser(userId).subscribe({
      next: () => {
        this.snackBar.open('User deactivated', 'Close', { duration: 2000 });
        this.loadUsers();
        this.loadAuditLogs();
      },
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      Verified: 'verified',
      Pending: 'pending',
      InReview: 'inreview',
      Flagged: 'flagged',
    };
    return map[status] || '';
  }

  getRoleLabel(role: string): string {
    return role === 'GeneralUser' ? 'General User' : role;
  }
}
