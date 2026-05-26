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
import { FormsModule } from '@angular/forms';
import { RecordService } from '../../../core/services/record.service';
import { AuthService } from '../../../core/services/auth.service';
import { Record as VerificationRecord } from '../../../core/models/record.model';

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
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  records = signal<VerificationRecord[]>([]);
  isLoading = signal(false);
  delay = signal(0);
  displayedColumns = ['recordId', 'type', 'status', 'details', 'createdAt'];
  skeletonCards = [1, 2, 3, 4];
  skeletonRows = [1, 2, 3, 4, 5];

  stats = signal({ total: 0, verified: 0, pending: 0, flagged: 0 });

  constructor(
    public authService: AuthService,
    private recordService: RecordService,
  ) {}

  ngOnInit(): void {
    this.loadRecords();
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
}
