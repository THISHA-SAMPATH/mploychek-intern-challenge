import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  isLoading = signal(true);

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (u) => {
        this.user.set(u);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      Verified: '#388e3c',
      Pending: '#5f6f89',
      InReview: '#1976d2',
      Flagged: '#d32f2f',
    };
    return map[status] || '#666';
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

  getVerificationProgress(status: string): number {
    const map: Record<string, number> = {
      Pending: 25,
      InReview: 60,
      Verified: 100,
      Flagged: 40,
    };
    return map[status] || 0;
  }
}
