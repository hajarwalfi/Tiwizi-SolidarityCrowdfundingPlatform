import { Pipe, PipeTransform } from '@angular/core';
import { CAMPAIGN_CATEGORY_LABELS } from '../constants/categories.constant';

@Pipe({
  name: 'categoryName',
  standalone: true
})
export class CategoryNamePipe implements PipeTransform {

  /**
   * Transforms a campaign category code to its display label
   * @param categoryCode The category code (e.g., 'SANTE', 'EDUCATION')
   * @returns The translated category label or the code itself if not found
   */
  transform(categoryCode: string | null | undefined): string {
    if (!categoryCode) {
      return '';
    }

    return CAMPAIGN_CATEGORY_LABELS[categoryCode] || categoryCode;
  }
}
