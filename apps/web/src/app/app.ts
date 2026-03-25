import { Component } from '@angular/core';

type ServiceItem = {
  title: string;
  description: string;
};

type GalleryItem = {
  title: string;
  category: string;
  imageUrl: string;
};

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly companyName = 'Evolution Painting Solutions';
  protected readonly leadApiBaseUrl = '/api';
  protected isSubmittingLead = false;
  protected leadSuccessMessage = '';
  protected leadErrorMessage = '';

  protected readonly services: ServiceItem[] = [
    {
      title: 'Interior Painting',
      description: 'Walls, trim, ceilings, and detailed prep for clean and durable interior finishes.'
    },
    {
      title: 'Exterior Painting',
      description: 'Weather-ready coatings and full surface prep to protect and refresh curb appeal.'
    },
    {
      title: 'Cabinet Refinishing',
      description: 'Smooth spray-grade finishes to modernize kitchens and built-ins without replacement.'
    },
    {
      title: 'Commercial Spaces',
      description: 'Flexible scheduling and professional execution for offices, retail, and rental units.'
    }
  ];

  protected readonly gallery: GalleryItem[] = [
    {
      title: 'Modern Exterior Concept',
      category: 'Exterior Inspiration',
      imageUrl:
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Premium Living Room Palette',
      category: 'Interior Inspiration',
      imageUrl:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Clean Kitchen Finishing',
      category: 'Cabinet Inspiration',
      imageUrl:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  protected async submitLead(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const serviceType = String(formData.get('serviceType') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!fullName || !email || !phone || !serviceType) {
      this.leadErrorMessage = 'Please fill in all required fields.';
      this.leadSuccessMessage = '';
      return;
    }

    this.isSubmittingLead = true;
    this.leadErrorMessage = '';
    this.leadSuccessMessage = '';

    try {
      const response = await fetch(`${this.leadApiBaseUrl}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, phone, serviceType, message })
      });

      if (!response.ok) {
        throw new Error('Lead request failed.');
      }

      form.reset();
      this.leadSuccessMessage = 'Thanks. Your quote request was sent successfully.';
    } catch {
      this.leadErrorMessage = 'Unable to submit right now. Please try again shortly.';
    } finally {
      this.isSubmittingLead = false;
    }
  }
}
