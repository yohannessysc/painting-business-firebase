import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cleaning-page',
  imports: [RouterLink],
  templateUrl: './cleaning.page.html',
  styleUrl: './cleaning.page.scss'
})
export class CleaningPage {
  protected readonly cleaningTracks = [
    {
      title: 'Residential',
      subtitle: 'Homes, Condos, And Apartments',
      imageUrl: '/images/cleaning/residential-cleaning.jpg',
      imageAlt: 'Cleaner working in a residential kitchen during a home cleaning service',
      highlights: [
        'Apartment, condo, and home cleaning with checklist-based scope',
        'One-time, recurring, and move-in or move-out options',
        'Pricing guided by square footage, room count, and condition'
      ]
    },
    {
      title: 'Commercial',
      subtitle: 'Offices, Retail, And Shared Spaces',
      imageUrl: '/images/cleaning/commercial-cleaning.jpg',
      imageAlt: 'Professional cleaner maintaining a commercial office environment',
      highlights: [
        'Office and retail cleaning with weekday or weekend scheduling',
        'Detailed scope per floor or unit to avoid quote surprises',
        'Flexible recurring plans with clear service logs'
      ]
    }
  ];

  protected readonly quoteInputs = [
    'Property type: residential or commercial',
    'Approximate square footage',
    'Service frequency: one-time or recurring',
    'Current condition and priority areas'
  ];
}
