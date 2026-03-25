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
        'https://images.unsplash.com/photo-1616594039964-3c8b6f3e2590?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Clean Kitchen Finishing',
      category: 'Cabinet Inspiration',
      imageUrl:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80'
    }
  ];
}
