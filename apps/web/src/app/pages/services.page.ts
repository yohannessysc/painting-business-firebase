import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { services } from '../site-content';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink],
  templateUrl: './services.page.html',
  styleUrl: './services.page.scss'
})
export class ServicesPage {
  protected readonly services = services;
  protected readonly fallbackImageUrl = '/images/placeholder-painting.svg';
  protected estimateResult = '';
  protected estimateError = '';
  protected isEstimating = false;

  protected readonly includedScope = [
    'Prep, masking, and clean cut lines',
    'Daily cleanup and final touch-ups'
  ];

  protected readonly addOnScope = [
    'Major repairs and specialty restoration',
    'Permit-related or trade-specific work'
  ];

  protected handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }

    image.onerror = null;
    image.src = this.fallbackImageUrl;
  }

  protected async calculateEstimate(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const serviceType = String(formData.get('serviceType') ?? 'Interior Painting');
    const projectSize = String(formData.get('projectSize') ?? 'medium');
    const condition = String(formData.get('condition') ?? 'standard');

    this.isEstimating = true;
    this.estimateError = '';
    this.estimateResult = '';

    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType,
          projectSize,
          condition
        })
      });

      if (!response.ok) {
        throw new Error('Estimate request failed');
      }

      const data = (await response.json()) as { low: number; high: number; note?: string };
      this.estimateResult = `Estimated range: $${data.low.toLocaleString()} - $${data.high.toLocaleString()} (${data.note ?? 'Final pricing confirmed after consultation.'})`;
    } catch {
      this.estimateError = 'Unable to calculate estimate right now. Please try again shortly.';
    } finally {
      this.isEstimating = false;
    }
  }
}
