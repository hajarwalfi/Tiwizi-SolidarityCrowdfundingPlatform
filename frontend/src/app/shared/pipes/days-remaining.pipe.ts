import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysRemaining',
  standalone: true
})
export class DaysRemainingPipe implements PipeTransform {

  /**
   * Calculates days remaining from creation date
   * Assumes default campaign duration of 30 days
   * @param createdAt ISO date string of campaign creation
   * @param duration Campaign duration in days (default: 30)
   * @returns Number of days remaining (0 if campaign ended)
   */
  transform(createdAt: string | Date, duration: number = 30): number {
    if (!createdAt) {
      return 0;
    }

    const created = new Date(createdAt);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(duration - daysPassed, 0);
  }
}
