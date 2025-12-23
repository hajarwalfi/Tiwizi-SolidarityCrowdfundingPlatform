import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tailwind-test',
  imports: [],
  templateUrl: './tailwind-test.html',
  styleUrl: './tailwind-test.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TailwindTest {

}
