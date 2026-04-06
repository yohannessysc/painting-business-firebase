import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { companyName, trustHighlights } from '../site-content';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage {
  protected readonly companyName = companyName;
  protected readonly trustHighlights = trustHighlights;
  protected readonly heroImage = '/images/stock/hero-home.jpg';
  protected readonly fallbackImageUrl = '/images/placeholder-painting.svg';

  protected readonly customerPriorities = [
    {
      title: 'Straight Quotes',
      description: 'Clear scope and pricing before work starts.'
    },
    {
      title: 'Reliable Scheduling',
      description: 'We start on time and keep your project moving.'
    },
    {
      title: 'Clean Worksites',
      description: 'Daily cleanup with floor and furniture protection.'
    },
    {
      title: 'Quality Checked',
      description: 'Final walkthrough and touch-ups before closeout.'
    }
  ];

  protected readonly featuredServices = [
    {
      title: 'Interior Painting',
      description: 'Walls, ceilings, and trim done clean and fast.'
    },
    {
      title: 'Exterior Painting',
      description: 'Durable coatings for siding, stucco, and trim.'
    },
    {
      title: 'Cabinet Refinishing',
      description: 'Smooth cabinet refinishing without full replacement.'
    }
  ];

  protected readonly quoteSteps = [
    {
      step: 'Step 01',
      title: 'Tell Us The Scope',
      description: 'Share what you need painted and your target timeline.'
    },
    {
      step: 'Step 02',
      title: 'Receive Your Quote',
      description: 'Get a written quote with prep details and pricing.'
    },
    {
      step: 'Step 03',
      title: 'Book And Paint',
      description: 'Lock in your date and we execute with daily cleanup.'
    }
  ];

  protected handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }

    image.onerror = null;
    image.src = this.fallbackImageUrl;
  }
}
