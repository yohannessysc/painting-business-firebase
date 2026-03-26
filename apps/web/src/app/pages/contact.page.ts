import { Component } from '@angular/core';
import { contactEmail, contactPhone, serviceAreas } from '../site-content';

@Component({
  selector: 'app-contact-page',
  imports: [],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss'
})
export class ContactPage {
  protected readonly contactEmail = contactEmail;
  protected readonly contactPhone = contactPhone;
  protected readonly serviceAreas = serviceAreas;
  protected readonly minBookingDate = new Date().toISOString().split('T')[0];
  protected readonly consultationModes = [
    'On-site estimate for larger projects',
    'Virtual quote based on photos/video',
    'Phone-first scope planning'
  ];
  protected isSubmittingLead = false;
  protected leadSuccessMessage = '';
  protected leadErrorMessage = '';

  protected async submitLead(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const serviceType = String(formData.get('serviceType') ?? '').trim();
    const consultationType = String(formData.get('consultationType') ?? '').trim();
    const preferredDate = String(formData.get('preferredDate') ?? '').trim();
    const preferredTimeSlot = String(formData.get('preferredTimeSlot') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!fullName || !email || !phone || !serviceType || !consultationType || !preferredTimeSlot) {
      this.leadErrorMessage = 'Please fill in all required fields.';
      this.leadSuccessMessage = '';
      return;
    }

    this.isSubmittingLead = true;
    this.leadErrorMessage = '';
    this.leadSuccessMessage = '';

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        fullName,
        email,
        phone,
        serviceType,
        consultationType,
        preferredDate,
        preferredTimeSlot,
          message
        })
      });

      if (!response.ok) {
        throw new Error('Lead API request failed');
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
