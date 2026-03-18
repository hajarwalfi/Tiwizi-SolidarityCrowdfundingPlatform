import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories-section.component.html',
  host: { style: 'display:block;height:100%' }
})
export class CategoriesSectionComponent {}
