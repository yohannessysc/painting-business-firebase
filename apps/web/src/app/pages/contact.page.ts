import { Component, OnInit } from '@angular/core';
import { contactEmail, contactPhone, serviceAreas } from '../site-content';

@Component({
  selector: 'app-contact-page',
  imports: [],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss'
})
export class ContactPage implements OnInit {
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
  protected isLoadingSlots = false;
  protected selectedConsultationType = 'In-Person Consultation';
  protected selectedPreferredDate = '';
  protected availableTimeSlots: string[] = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];
  protected leadSuccessMessage = '';
  protected leadErrorMessage = '';

  async ngOnInit(): Promise<void> {
    await this.loadAvailableTimeSlots();
  }

  protected async handleConsultationTypeChange(event: Event): Promise<void> {
    const element = event.target as HTMLSelectElement | null;
    this.selectedConsultationType = element?.value || 'In-Person Consultation';
    await this.loadAvailableTimeSlots();
  }

  protected async handlePreferredDateChange(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement | null;
    this.selectedPreferredDate = element?.value || '';
    await this.loadAvailableTimeSlots();
  }

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

  private async loadAvailableTimeSlots(): Promise<void> {
    this.isLoadingSlots = true;

    try {
      const params = new URLSearchParams({
        consultationType: this.selectedConsultationType
      });

      if (this.selectedPreferredDate) {
        params.set('preferredDate', this.selectedPreferredDate);
      }

      const response = await fetch(`/api/slots?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Slots request failed');
      }

      const data = (await response.json()) as { slots?: string[] };
      if (Array.isArray(data.slots) && data.slots.length > 0) {
        this.availableTimeSlots = data.slots;
      }
    } catch {
      // Keep fallback slots to avoid blocking user submission.
      this.availableTimeSlots = [
        '8:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 2:00 PM',
        '2:00 PM - 4:00 PM',
        '4:00 PM - 6:00 PM'
      ];
    } finally {
      this.isLoadingSlots = false;
    }
  }
}
