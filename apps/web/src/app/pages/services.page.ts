import { Component } from '@angular/core';
import { services } from '../site-content';

@Component({
  selector: 'app-services-page',
  imports: [],
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
    'Surface prep: patching, sanding, and masking before painting',
    'Furniture/floor protection and daily cleanup on active work areas',
    'Professional-grade materials selected for durability and finish consistency',
    'Final walkthrough with touch-up corrections before closeout'
  ];

  protected readonly excludedScope = [
    'Major structural repairs and mold remediation work',
    'Electrical, plumbing, or HVAC adjustments',
    'Custom millwork fabrication or drywall replacement at scale',
    'Permit handling where municipal approvals are required'
  ];

  protected readonly serviceFaqs = [
    {
      question: 'How quickly can we start after I request a quote?',
      answer: 'Most quote requests receive an initial response within 48 hours. Start dates depend on scope, weather, and materials.'
    },
    {
      question: 'Do you offer both in-person and virtual estimates?',
      answer: 'Yes. You can choose in-person consultation, virtual walkthrough, or a phone planning call based on project complexity.'
    },
    {
      question: 'What happens if we find additional prep work during the job?',
      answer: 'We pause and explain findings with updated scope and pricing before proceeding, so there are no surprise additions.'
    },
    {
      question: 'Are products and finish options discussed before work starts?',
      answer: 'Yes. We confirm coating systems, sheen options, and expected maintenance so the finish matches your goals.'
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
