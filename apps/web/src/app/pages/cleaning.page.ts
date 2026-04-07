import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cleaning-page',
  imports: [RouterLink],
  templateUrl: './cleaning.page.html',
  styleUrl: './cleaning.page.scss'
})
export class CleaningPage {
  protected readonly residentialHighlights = [
    'Apartment, condo, and home cleaning with checklist-based scope',
    'One-time, recurring, and move-in or move-out options',
    'Pricing guided by square footage, room count, and condition'
  ];

  protected readonly commercialHighlights = [
    'Office and retail cleaning with weekday or weekend scheduling',
    'Detailed scope per floor or unit to avoid quote surprises',
    'Flexible recurring plans with clear service logs'
  ];

  protected readonly quoteInputs = [
    'Property type: Residential or Commercial',
    'Approximate square footage',
    'Service frequency: one-time or recurring',
    'Current condition and priority areas'
  ];
}
