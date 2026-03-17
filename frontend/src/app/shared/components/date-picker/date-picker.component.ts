import { Component, forwardRef, signal, computed, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true }],
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent implements ControlValueAccessor {
  @ViewChild('trigger') triggerRef!: ElementRef<HTMLButtonElement>;

  dropdownTop = signal(0);
  dropdownLeft = signal(0);

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isOpen()) this.updateDropdownPosition();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isOpen()) this.updateDropdownPosition();
  }

  isOpen = signal(false);
  selectedDate = signal<Date | null>(null);
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());

  private onChange: (val: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  readonly WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  calendarDays = computed(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; currentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), currentMonth: false });
    }

    return days;
  });

  get displayValue(): string {
    const d = this.selectedDate();
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get monthLabel(): string {
    return `${this.MONTHS[this.viewMonth()]} ${this.viewYear()}`;
  }

  toggle(): void {
    if (!this.isOpen()) this.updateDropdownPosition();
    this.isOpen.update(v => !v);
    this.onTouched();
  }

  private updateDropdownPosition(): void {
    const rect = this.triggerRef.nativeElement.getBoundingClientRect();
    this.dropdownTop.set(rect.bottom + 8);
    this.dropdownLeft.set(rect.left);
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else { this.viewMonth.update(m => m - 1); }
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else { this.viewMonth.update(m => m + 1); }
  }

  select(date: Date): void {
    this.selectedDate.set(date);
    this.viewMonth.set(date.getMonth());
    this.viewYear.set(date.getFullYear());
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.onChange(iso);
    this.isOpen.set(false);
  }

  selectToday(): void {
    this.select(new Date());
  }

  clear(): void {
    this.selectedDate.set(null);
    this.onChange(null);
    this.isOpen.set(false);
  }

  isSelected(date: Date): boolean {
    const s = this.selectedDate();
    return !!s && s.getFullYear() === date.getFullYear() && s.getMonth() === date.getMonth() && s.getDate() === date.getDate();
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return t.getFullYear() === date.getFullYear() && t.getMonth() === date.getMonth() && t.getDate() === date.getDate();
  }

  writeValue(value: string | null): void {
    if (value) {
      // Parse YYYY-MM-DD without timezone shift
      const [y, m, d] = value.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      this.selectedDate.set(date);
      this.viewMonth.set(date.getMonth());
      this.viewYear.set(date.getFullYear());
    } else {
      this.selectedDate.set(null);
    }
  }

  registerOnChange(fn: (val: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
