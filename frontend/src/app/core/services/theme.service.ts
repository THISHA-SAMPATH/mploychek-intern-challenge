import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.isDark.set(true);
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDark.update((v) => !v);
    if (this.isDark()) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}