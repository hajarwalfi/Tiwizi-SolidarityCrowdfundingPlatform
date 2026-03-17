import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyMad',
  standalone: true
})
export class CurrencyMadPipe implements PipeTransform {

  transform(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
      return '0,00 MAD';
    }

    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }
}
