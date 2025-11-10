import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WrapperComponent } from './components/wrapper/wrapper.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WrapperComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
