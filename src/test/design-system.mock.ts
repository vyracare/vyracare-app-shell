import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'vc-button',
  standalone: true,
  template: `
    <button [type]="type" [disabled]="disabled || loading" (click)="clicked.emit($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class VcButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant = 'primary';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() full = false;
  @Output() clicked = new EventEmitter<Event>();
}

@Component({
  selector: 'vc-input',
  standalone: true,
  template: `
    <label [attr.for]="id">{{ label }}</label>
    <input
      [id]="id"
      [type]="type"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [value]="value"
      (input)="handleInput($event)"
      (blur)="onTouched()"
    />
    @if (error) {
      <small>{{ error }}</small>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VcInputComponent),
      multi: true
    }
  ]
})
export class VcInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() mask = '';
  @Input() error = '';
  value = '';
  disabled = false;
  onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
}

@Component({
  selector: 'vc-heading',
  standalone: true,
  template: '<h1><ng-content></ng-content></h1>'
})
export class VcHeadingComponent {
  @Input() level = 1;
}

@Component({
  selector: 'vc-text',
  standalone: true,
  template: '<p><ng-content></ng-content></p>'
})
export class VcTextComponent {
  @Input() muted = false;
  @Input() size = 'md';
}

@Component({
  selector: 'vc-navbar',
  standalone: true,
  template: ''
})
export class VcNavbarComponent {
  @Input() brandLabel = '';
  @Input() brandAccent = '';
  @Input() brandSubtitle = '';
  @Input() logoClickable = false;
  @Input() searchValue = '';
  @Input() notifications: unknown[] = [];
  @Input() profileName = '';
  @Input() profileRole = '';
  @Input() profileInitials = '';
  @Input() profileActions: unknown[] = [];
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() logoClicked = new EventEmitter<void>();
  @Output() profileActionSelected = new EventEmitter<unknown>();
}

@Component({
  selector: 'vc-sidebar',
  standalone: true,
  template: ''
})
export class VcSidebarComponent {
  @Input() groups: unknown[] = [];
  @Input() activeItemId = '';
  @Input() support: unknown = null;
  @Output() itemSelected = new EventEmitter<unknown>();
}
