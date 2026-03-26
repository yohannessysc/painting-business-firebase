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
  protected readonly heroImage =
    'https://images.pexels.com/photos/5493650/pexels-photo-5493650.jpeg?auto=compress&cs=tinysrgb&w=1600';
  protected readonly fallbackImageUrl = '/images/placeholder-painting.svg';

  protected readonly customerPriorities = [
    {
      title: 'Clear, Honest Pricing',
      description: 'Every quote includes a written scope so you can see exactly what is included before work starts.'
    },
    {
      title: 'Fast, Organized Execution',
      description: 'We keep projects moving with scheduled milestones, efficient prep, and clean handoffs by area.'
    },
    {
      title: 'Clean And Careful Worksites',
      description: 'Your floors, furniture, and fixtures are protected, and we clean up daily to reduce disruption.'
    },
    {
      title: 'Owner-Led Quality Checks',
      description: 'As a startup, we stay hands-on to earn trust on every project and deliver consistent quality.'
    }
  ];

  protected readonly featuredServices = [
    {
      title: 'Interior Painting',
      description: 'Walls, ceilings, trim, and feature walls with smooth finishes and clean cut lines.',
      route: '/services'
    },
    {
      title: 'Exterior Painting',
      description: 'Weather-smart prep and protective coatings for siding, stucco, trim, and entry points.',
      route: '/services'
    },
    {
      title: 'Cabinet Refinishing',
      description: 'Factory-style refinishing to refresh outdated cabinetry without full replacement costs.',
      route: '/services'
    }
  ];

  protected readonly startupPromise = [
    'Owner-led project oversight from quote to handover',
    'Photo updates and milestone check-ins during the job',
    'Final walkthrough and touch-up completion before sign-off',
    'Product and finish guidance based on your space and lighting'
  ];

  protected readonly quoteSteps = [
    {
      step: 'Step 01',
      title: 'Share Your Project Details',
      description: 'Tell us what you need painted, your timeline, and whether this is residential or commercial.'
    },
    {
      step: 'Step 02',
      title: 'Get A Clear Written Quote',
      description: 'We provide a practical scope with prep details, material approach, and transparent pricing.'
    },
    {
      step: 'Step 03',
      title: 'Book Your Start Date',
      description: 'Confirm your preferred schedule and we handle the job with daily updates and tidy closeout.'
    }
  ];

  protected readonly consultationOptions = [
    {
      title: 'On-Site Consultation',
      description: 'Ideal for larger jobs where we need to inspect surfaces, repairs, and access in person.',
      cta: 'Book On-Site Quote'
    },
    {
      title: 'Virtual Walkthrough',
      description: 'Fast estimate path by sharing photos or video walkthrough with your scope and timeline.',
      cta: 'Start Virtual Quote'
    },
    {
      title: 'Phone Planning Call',
      description: 'Quickly confirm service fit, timing, and next steps before sending your full quote request.',
      cta: 'Request A Call'
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
