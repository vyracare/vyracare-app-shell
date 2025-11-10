import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { WrapperComponent } from './wrapper.component';

describe('WrapperComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should render the layout shell', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar')).not.toBeNull();
    expect(compiled.querySelector('.sidebar')).not.toBeNull();
    expect(compiled.querySelector('.shell-main')).not.toBeNull();
  });

  it('should host a router outlet inside main area', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const outlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(outlet).not.toBeNull();
  });
});
