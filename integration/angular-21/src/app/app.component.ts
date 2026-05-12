import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  // UI Shell
  NgccHeader,
  NgccHeaderName,
  NgccHeaderNavigation,
  NgccHeaderItem,
  NgccHeaderGlobal,
  NgccHamburger,
  // Navigation
  NgccBreadcrumbComponent,
  NgccBreadcrumbItemComponent,
  // Core Inputs
  NgccButton,
  NgccToggle,
  NgccCheckbox,
  NgccInput,
  NgccDropdown,
  // Display
  NgccAccordion,
  NgccAccordionItem,
  NgccTabs,
  NgccTab,
  NgccTabHeaders,
  NgccModal,
  NgccTooltip,
  NgccSkeleton,
  NgccPagination,
  // Notifications
  NgccNotificationContainer,
  NotificationService,
  NgccToastContainer,
  ToastService,
  // i18n
  NgccI18nPipe,
  // Theme
  NgccColorThemeSwitcher,
  NgccColorThemeService,
} from '@assistanz/carbideui';

/**
 * Integration smoke-test: verifies that every major export category of
 * @assistanz/carbideui resolves correctly, compiles under strict Angular
 * templates, and tree-shakes without error in an Angular 21 consumer.
 *
 * Checks exercised:
 *  ✓ Named imports resolve (no TS7016 / NG1010)
 *  ✓ Standalone imports compile with strictTemplates
 *  ✓ DI providers (NotificationService, ToastService, NgccColorThemeService) inject correctly
 *  ✓ Signal-based inputs bind without type errors
 *  ✓ NgccI18nPipe works in an imports-based standalone component
 *  ✓ provideNgccI18n() factory is callable without NgModule
 *  ✓ Angular 21 specific: @let template syntax and improved control flow
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // UI Shell
    NgccHeader,
    NgccHeaderName,
    NgccHeaderNavigation,
    NgccHeaderItem,
    NgccHeaderGlobal,
    NgccHamburger,
    // Navigation
    NgccBreadcrumbComponent,
    NgccBreadcrumbItemComponent,
    // Core Inputs
    NgccButton,
    NgccToggle,
    NgccCheckbox,
    NgccInput,
    NgccDropdown,
    // Display
    NgccAccordion,
    NgccAccordionItem,
    NgccTabs,
    NgccTab,
    NgccTabHeaders,
    NgccModal,
    NgccTooltip,
    NgccSkeleton,
    NgccPagination,
    // Notifications
    NgccNotificationContainer,
    NgccToastContainer,
    // i18n
    NgccI18nPipe,
    // Theme
    NgccColorThemeSwitcher,
  ],
  providers: [
    NotificationService,
    ToastService,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);
  readonly colorThemeService = inject(NgccColorThemeService);

  readonly isModalOpen = signal(false);
  readonly toggleValue = signal(false);
  readonly checkboxValue = signal(false);
  readonly currentPage = signal(1);
  readonly inputValue = signal('');

  readonly dropdownOptions = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  triggerNotification(): void {
    this.notificationService.show({
      title: 'Integration Test',
      subtitle: 'CarbideUI notification service works!',
      type: 'success',
    });
  }

  triggerToast(): void {
    this.toastService.show({
      title: 'Toast Check',
      subtitle: 'Toast service resolves correctly from dist.',
      type: 'info',
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
