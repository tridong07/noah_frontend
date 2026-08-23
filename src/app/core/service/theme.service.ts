// theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    let isDark = false;

    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.setDarkMode(isDark);
  }

  public toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkModeSubject.value);
  }

  public setDarkMode(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  public isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}