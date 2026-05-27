import { Component, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {

  loginForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);

  // Logo state animation triggers
  showLogo = signal(false);
  isTransitioning = signal(false);
  typedQuote = signal('');
  isTypingComplete = signal(false);
  isQuotePulseActive = signal(false);
  
  private isTypingStarted = false;
  private fullQuoteText = "The true measure of any system is its ability to build certainty out of complexity, ensuring that trust is not a gamble, but a solid foundation upon which human potential can be safely recognized.";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['GeneralUser', [Validators.required]],
    });

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    // Trigger logo fade-in after 1.2 seconds
    setTimeout(() => {
      this.showLogo.set(true);
    }, 1200);

    // Trigger zoom scale transition at 3.2 seconds
    setTimeout(() => {
      this.isTransitioning.set(true);
      setTimeout(() => {
        this.startTypingQuote();
      }, 600);
    }, 3200);

    // Trigger auto-scroll to the login page after 3.8 seconds
    setTimeout(() => {
      this.autoScrollToLogin();
    }, 3800);
  }

  autoScrollToLogin(): void {
    if (!this.isTransitioning()) {
      this.isTransitioning.set(true);
      setTimeout(() => {
        this.startTypingQuote();
      }, 600);
    }
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  startTypingQuote(): void {
    if (this.isTypingStarted) return;
    this.isTypingStarted = true;

    let index = 0;
    this.typedQuote.set('');
    this.isTypingComplete.set(false);

    const typingInterval = setInterval(() => {
      if (index < this.fullQuoteText.length) {
        this.typedQuote.set(this.fullQuoteText.substring(0, index + 1));
        index++;
      } else {
        this.isTypingComplete.set(true);
        clearInterval(typingInterval);
      }
    }, 18);
  }

  triggerInteractiveQuote(): void {
    // Reset typing state so it can retype
    this.isTypingStarted = false;
    this.typedQuote.set('');
    this.isTypingComplete.set(false);
    
    // Retrigger the typewriter
    this.startTypingQuote();

    // Trigger the click-pulse scaling animation
    this.isQuotePulseActive.set(true);
    setTimeout(() => {
      this.isQuotePulseActive.set(false);
    }, 600);
  }

  scrollToLogin(event: Event): void {
    event.preventDefault();
    this.autoScrollToLogin();
  }

  isDarkTheme(): boolean {
    return this.themeService.isDark();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.snackBar.open(
          `Welcome back, ${response.user.name}!`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(
          err.error?.message || 'Login failed. Please try again.',
          'Close',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      },
    });
  }

  fillDemo(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.loginForm.patchValue({ userId: 'USR001', password: 'password123', role: 'Admin' });
    } else {
      this.loginForm.patchValue({ userId: 'USR002', password: 'password123', role: 'GeneralUser' });
    }
  }

  loginAsDemo(role: 'admin' | 'user'): void {
    this.fillDemo(role);
    this.loginForm.markAllAsTouched();
    this.onSubmit();
  }
}
