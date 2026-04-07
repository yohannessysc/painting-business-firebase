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
    },
    {
      title: 'Weekend-Friendly Scheduling',
      description: 'Focused booking windows for teams that need flexible service days.'
    }
  ];

  protected readonly featuredTracks = [
    {
      title: 'Painting Services',
      description: 'Interior, exterior, cabinet, and commercial paint work with prep and daily cleanup.',
      cta: '/services',
      ctaLabel: 'Explore Painting'
    },
    {
      title: 'Cleaning Services',
      description: 'Residential and commercial cleaning scoped by size, frequency, and property needs.',
      cta: '/cleaning',
      ctaLabel: 'Explore Cleaning'
    }
  ];

  protected readonly quoteSteps = [
    {
      step: 'Step 01',
      title: 'Tell Us The Scope',
      description: 'Share what you need for painting, cleaning, or both and your target timeline.'
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
