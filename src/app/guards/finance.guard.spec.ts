import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth/auth.service';
import { FinanceGuard } from './finance.guard';

describe('FinanceGuard', () => {
  const auth = { hasFinanceReadAccess: jest.fn() };
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [{ provide: AuthService, useValue: auth }]
    });
    router = TestBed.inject(Router);
  });

  it('allows authorized users', () => {
    auth.hasFinanceReadAccess.mockReturnValue(true);
    expect(TestBed.runInInjectionContext(() => FinanceGuard({} as never, {} as never))).toBe(true);
  });

  it('redirects unauthorized users', () => {
    auth.hasFinanceReadAccess.mockReturnValue(false);
    expect(TestBed.runInInjectionContext(() => FinanceGuard({} as never, {} as never))).toEqual(router.createUrlTree(['/dashboard']));
  });
});
