import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth';
import { TranslationService } from '../../../../shared/translate/translation.service';
import { provideRouter } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // 1. Mock AuthService thuần không phụ thuộc Jasmine
  const mockAuthService = {
    login: () => of({}),
    requestPasswordReset: () => of({ message: 'Success' })
  };

  // 2. Mock TranslationService thuần không phụ thuộc Jasmine
  const mockTranslationService = {
    getLanguages: () => of([
      { code: 'VN', name: 'Tiếng Việt', isDefault: true },
      { code: 'EN', name: 'English' }
    ]),
    getCurrentLang: () => 'VN',
    switchLang: (lang: string) => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    })
    .overrideComponent(LoginComponent, {
      remove: { imports: [TranslatePipe] },
      add: { imports: [] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch languages on init', () => {
    expect(component.languages.length).toBe(2);
  });
});