import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './shared/translate/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // 🟢 1. Inject TranslationService vào component
  private translationService = inject(TranslationService);

  protected readonly title = signal('NOAH_FRONTEND');

  ngOnInit(): void {
    // 🟢 2. Kích hoạt nạp i18n ngay khi vào trang web
    this.translationService.initLang();
  }
}