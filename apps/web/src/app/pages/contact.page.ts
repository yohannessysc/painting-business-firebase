import { Component, OnInit } from '@angular/core';
import { contactEmail, contactPhone, serviceAreas } from '../site-content';

type LeadFormField =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'serviceType'
  | 'cleaningPropertyType'
  | 'cleaningSquareFootage'
  | 'cleaningFrequency'
  | 'consultationType'
  | 'preferredDate'
  | 'preferredTimeSlot'
  | 'message';

@Component({
  selector: 'app-contact-page',
  imports: [],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss'
})
export class ContactPage implements OnInit {
  private static readonly maxLengths = {
    fullName: 100,
    email: 254,
    phone: 25,
    message: 1500
  } as const;

  protected readonly contactEmail = contactEmail;
  protected readonly contactPhone = contactPhone;
  protected readonly serviceAreas = serviceAreas;
  protected readonly minBookingDate = ContactPage.toUtcIsoDate(new Date());
  protected readonly consultationModes = [
    'On-site estimate for larger projects',
    'Virtual quote based on photos/video',
    'Phone-first scope planning'
  ];
  protected readonly cleaningPropertyTypes = ['Residential', 'Commercial'];
  protected readonly cleaningFrequencies = ['One-Time', 'Weekly', 'Bi-Weekly', 'Monthly'];
  protected isSubmittingLead = false;
  protected isLoadingSlots = false;
  protected selectedServiceType = '';
  protected selectedConsultationType = 'In-Person Consultation';
  protected selectedPreferredDate = '';
  protected selectedPreferredTimeSlot = '';
  protected availableTimeSlots: string[] = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];
  protected leadSuccessMessage = '';
  protected leadErrorMessage = '';
  protected fieldErrors: Partial<Record<LeadFormField, string>> = {};

  async ngOnInit(): Promise<void> {
    await this.loadAvailableTimeSlots();
  }

  protected async handleConsultationTypeChange(event: Event): Promise<void> {
    const element = event.target as HTMLSelectElement | null;
    this.selectedConsultationType = element?.value || 'In-Person Consultation';
    this.clearFieldError('consultationType');
    await this.loadAvailableTimeSlots();
  }

  protected handleServiceTypeChange(event: Event): void {
    const element = event.target as HTMLSelectElement | null;
    this.selectedServiceType = element?.value || '';
    this.clearFieldError('serviceType');

    if (!this.isCleaningServiceSelected()) {
      this.clearFieldError('cleaningPropertyType');
      this.clearFieldError('cleaningSquareFootage');
      this.clearFieldError('cleaningFrequency');
    }
  }

  protected async handlePreferredDateChange(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement | null;
    this.selectedPreferredDate = element?.value || '';
    this.clearFieldError('preferredDate');
    await this.loadAvailableTimeSlots();
  }

  protected handlePreferredTimeSlotChange(event: Event): void {
    const element = event.target as HTMLSelectElement | null;
    this.selectedPreferredTimeSlot = element?.value || '';
    this.clearFieldError('preferredTimeSlot');
  }

  protected handleFieldInput(field: LeadFormField): void {
    this.clearFieldError(field);
  }

  protected get bookingHelperMessage(): string {
    if (this.isLoadingSlots) {
      return 'Checking current availability...';
    }

    if (!this.selectedPreferredDate) {
      return '';
    }

    if (this.selectedPreferredDate < this.minBookingDate) {
      return 'Selected date is in the past. Please choose a valid date.';
    }

    if (this.availableTimeSlots.length === 0) {
      return 'No time slots available for this date. Please choose another date.';
    }

    if (this.selectedPreferredDate === this.minBookingDate) {
      return 'Past times are disabled automatically.';
    }

    return '';
  }

  protected isTimeSlotSelectDimmed(): boolean {
    if (!this.selectedPreferredDate) {
      return false;
    }

    return this.selectedPreferredDate < this.minBookingDate || this.availableTimeSlots.length === 0;
  }

  protected isTimeSlotDisabled(slot: string): boolean {
    return !this.availableTimeSlots.includes(slot);
  }

  protected getFieldError(field: LeadFormField): string {
    return this.fieldErrors[field] ?? '';
  }

  protected isCleaningServiceSelected(): boolean {
    return this.isCleaningServiceType(this.selectedServiceType);
  }

  protected async submitLead(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const serviceType = String(formData.get('serviceType') ?? '').trim();
    const cleaningPropertyType = String(formData.get('cleaningPropertyType') ?? '').trim();
    const cleaningSquareFootage = String(formData.get('cleaningSquareFootage') ?? '').trim();
    const cleaningFrequency = String(formData.get('cleaningFrequency') ?? '').trim();
    const consultationType = String(formData.get('consultationType') ?? '').trim();
    const preferredDate = String(formData.get('preferredDate') ?? '').trim();
    const preferredTimeSlot = String(formData.get('preferredTimeSlot') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const website = String(formData.get('website') ?? '').trim();

    this.selectedServiceType = serviceType;
    this.selectedPreferredDate = preferredDate;
    this.selectedPreferredTimeSlot = preferredTimeSlot;

    this.fieldErrors = {};
    this.leadErrorMessage = '';
    this.leadSuccessMessage = '';

    let hasErrors = false;

    if (!fullName) {
      this.setFieldError('fullName', 'Full name is required.');
      hasErrors = true;
    }

    if (!email) {
      this.setFieldError('email', 'Email is required.');
      hasErrors = true;
    }

    if (!phone) {
      this.setFieldError('phone', 'Phone number is required.');
      hasErrors = true;
    }

    if (!serviceType) {
      this.setFieldError('serviceType', 'Please select a service.');
      hasErrors = true;
    }

    const isCleaningService = this.isCleaningServiceType(serviceType);
    if (isCleaningService) {
      if (!cleaningPropertyType) {
        this.setFieldError('cleaningPropertyType', 'Please choose residential or commercial.');
        hasErrors = true;
      }

      if (!cleaningSquareFootage) {
        this.setFieldError('cleaningSquareFootage', 'Please enter approximate square footage.');
        hasErrors = true;
      }

      if (!cleaningFrequency) {
        this.setFieldError('cleaningFrequency', 'Please choose a cleaning frequency.');
        hasErrors = true;
      }
    }

    if (!consultationType) {
      this.setFieldError('consultationType', 'Please choose a consultation type.');
      hasErrors = true;
    }

    if (!preferredDate) {
      this.setFieldError('preferredDate', 'Preferred date is required.');
      hasErrors = true;
    }

    if (!preferredTimeSlot) {
      this.setFieldError('preferredTimeSlot', 'Preferred time slot is required.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    if (fullName.length < 2 || fullName.length > ContactPage.maxLengths.fullName) {
      this.setFieldError('fullName', 'Please enter a valid full name (2-100 characters).');
      hasErrors = true;
    }

    if (email.length > ContactPage.maxLengths.email || !this.isValidEmail(email)) {
      this.setFieldError('email', 'Please enter a valid email address.');
      hasErrors = true;
    }

    if (phone.length > ContactPage.maxLengths.phone || !this.isValidPhone(phone)) {
      this.setFieldError('phone', 'Please enter a valid phone number.');
      hasErrors = true;
    }

    if (message.length > ContactPage.maxLengths.message) {
      this.setFieldError('message', 'Project details are too long (maximum 1500 characters).');
      hasErrors = true;
    }

    if (this.hasDisallowedControlChars(fullName)) {
      this.setFieldError('fullName', 'This field contains invalid characters.');
      hasErrors = true;
    }

    if (this.hasDisallowedControlChars(email)) {
      this.setFieldError('email', 'This field contains invalid characters.');
      hasErrors = true;
    }

    if (this.hasDisallowedControlChars(phone)) {
      this.setFieldError('phone', 'This field contains invalid characters.');
      hasErrors = true;
    }

    if (this.hasDisallowedControlChars(message)) {
      this.setFieldError('message', 'This field contains invalid characters.');
      hasErrors = true;
    }

    if (isCleaningService) {
      if (!this.cleaningPropertyTypes.includes(cleaningPropertyType)) {
        this.setFieldError('cleaningPropertyType', 'Please select a valid property type.');
        hasErrors = true;
      }

      if (!/^\d+$/.test(cleaningSquareFootage)) {
        this.setFieldError('cleaningSquareFootage', 'Square footage must be a whole number.');
        hasErrors = true;
      } else {
        const sqft = Number.parseInt(cleaningSquareFootage, 10);
        if (sqft < 100 || sqft > 200000) {
          this.setFieldError('cleaningSquareFootage', 'Square footage must be between 100 and 200000.');
          hasErrors = true;
        }
      }

      if (!this.cleaningFrequencies.includes(cleaningFrequency)) {
        this.setFieldError('cleaningFrequency', 'Please select a valid cleaning frequency.');
        hasErrors = true;
      }

      if (this.hasDisallowedControlChars(cleaningPropertyType)) {
        this.setFieldError('cleaningPropertyType', 'This field contains invalid characters.');
        hasErrors = true;
      }

      if (this.hasDisallowedControlChars(cleaningFrequency)) {
        this.setFieldError('cleaningFrequency', 'This field contains invalid characters.');
        hasErrors = true;
      }
    }

    if (preferredDate < this.minBookingDate) {
      this.setFieldError('preferredDate', 'Please choose today or a future date.');
      hasErrors = true;
    }

    if (this.isTimeSlotDisabled(preferredTimeSlot)) {
      this.setFieldError('preferredTimeSlot', 'Selected time slot is no longer available.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    this.isSubmittingLead = true;

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
          cleaningPropertyType,
          cleaningSquareFootage,
          cleaningFrequency,
          consultationType,
          preferredDate,
          preferredTimeSlot,
          website,
          message
        })
      });

      if (!response.ok) {
        throw new Error('Lead API request failed');
      }

      form.reset();
      this.selectedServiceType = '';
      this.selectedPreferredDate = '';
      this.selectedPreferredTimeSlot = '';
      this.fieldErrors = {};
      this.leadSuccessMessage = 'Thanks. Your quote request was sent successfully.';
    } catch {
      this.leadErrorMessage = 'Unable to submit right now. Please try again shortly.';
    } finally {
      this.isSubmittingLead = false;
    }
  }

  private async loadAvailableTimeSlots(): Promise<void> {
    this.isLoadingSlots = true;

    // Clear stale options while loading so unavailable dates don't show old slots.
    this.availableTimeSlots = [];

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
      if (Array.isArray(data.slots)) {
        this.availableTimeSlots = data.slots;
      }

      if (this.selectedPreferredTimeSlot && !this.availableTimeSlots.includes(this.selectedPreferredTimeSlot)) {
        this.selectedPreferredTimeSlot = '';
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

      if (this.selectedPreferredTimeSlot && !this.availableTimeSlots.includes(this.selectedPreferredTimeSlot)) {
        this.selectedPreferredTimeSlot = '';
      }
    } finally {
      this.isLoadingSlots = false;
    }
  }

  private static toUtcIsoDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    if (!/^[+()\-\s0-9.]+$/.test(phone)) {
      return false;
    }

    const digitCount = phone.replace(/\D/g, '').length;
    return digitCount >= 7 && digitCount <= 15;
  }

  private hasDisallowedControlChars(input: string): boolean {
    return /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input);
  }

  private setFieldError(field: LeadFormField, message: string): void {
    this.fieldErrors[field] = message;
  }

  private clearFieldError(field: LeadFormField): void {
    if (!this.fieldErrors[field]) {
      return;
    }

    this.fieldErrors[field] = '';
  }

  private isCleaningServiceType(serviceType: string): boolean {
    return serviceType === 'Residential Cleaning' || serviceType === 'Commercial Cleaning' || serviceType === 'Painting + Cleaning';
  }
}
