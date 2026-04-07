import { Component, OnInit } from '@angular/core';
import { contactEmail, contactPhone, serviceAreas } from '../site-content';

type LeadFormField =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'serviceType'
  | 'servicePropertyType'
  | 'serviceSquareFootage'
  | 'serviceDetail'
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
  protected readonly servicePropertyTypes = ['Residential', 'Commercial'];
  protected readonly cleaningFrequencies = ['One-Time', 'Weekly', 'Bi-Weekly', 'Monthly'];
  protected readonly paintingScopes = ['Interior', 'Exterior', 'Interior + Exterior'];
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

    if (!this.isServiceDetailsSelected()) {
      this.clearFieldError('servicePropertyType');
      this.clearFieldError('serviceSquareFootage');
      this.clearFieldError('serviceDetail');
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

  protected isServiceDetailsSelected(): boolean {
    return this.isServiceWithDetails(this.selectedServiceType);
  }

  protected get serviceDetailLabel(): string {
    if (this.isPaintingServiceType(this.selectedServiceType)) {
      return 'Painting scope';
    }

    return 'Cleaning frequency';
  }

  protected get serviceDetailPlaceholder(): string {
    if (this.isPaintingServiceType(this.selectedServiceType)) {
      return 'Select scope';
    }

    return 'Select frequency';
  }

  protected get serviceDetailOptions(): string[] {
    if (this.isPaintingServiceType(this.selectedServiceType)) {
      return this.paintingScopes;
    }

    return this.cleaningFrequencies;
  }

  protected async submitLead(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const serviceType = String(formData.get('serviceType') ?? '').trim();
    const servicePropertyType = String(formData.get('servicePropertyType') ?? '').trim();
    const serviceSquareFootage = String(formData.get('serviceSquareFootage') ?? '').trim();
    const serviceDetail = String(formData.get('serviceDetail') ?? '').trim();
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

    const requiresServiceDetails = this.isServiceWithDetails(serviceType);
    if (requiresServiceDetails) {
      if (!servicePropertyType) {
        this.setFieldError('servicePropertyType', 'Please choose residential or commercial.');
        hasErrors = true;
      }

      if (!serviceSquareFootage) {
        this.setFieldError('serviceSquareFootage', 'Please enter approximate square footage.');
        hasErrors = true;
      }

      if (!serviceDetail) {
        this.setFieldError('serviceDetail', 'Please select the service detail option.');
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

    if (requiresServiceDetails) {
      if (!this.servicePropertyTypes.includes(servicePropertyType)) {
        this.setFieldError('servicePropertyType', 'Please select a valid property type.');
        hasErrors = true;
      }

      if (!/^\d+$/.test(serviceSquareFootage)) {
        this.setFieldError('serviceSquareFootage', 'Square footage must be a whole number.');
        hasErrors = true;
      } else {
        const sqft = Number.parseInt(serviceSquareFootage, 10);
        if (sqft < 100 || sqft > 200000) {
          this.setFieldError('serviceSquareFootage', 'Square footage must be between 100 and 200000.');
          hasErrors = true;
        }
      }

      const validDetailOptions = this.isPaintingServiceType(serviceType)
        ? this.paintingScopes
        : this.cleaningFrequencies;

      if (!validDetailOptions.includes(serviceDetail)) {
        this.setFieldError('serviceDetail', 'Please select a valid detail option.');
        hasErrors = true;
      }

      if (this.hasDisallowedControlChars(servicePropertyType)) {
        this.setFieldError('servicePropertyType', 'This field contains invalid characters.');
        hasErrors = true;
      }

      if (this.hasDisallowedControlChars(serviceDetail)) {
        this.setFieldError('serviceDetail', 'This field contains invalid characters.');
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
          servicePropertyType,
          serviceSquareFootage,
          serviceDetail,
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

  private isServiceWithDetails(serviceType: string): boolean {
    return serviceType === 'Cleaning' || serviceType === 'Painting' || serviceType === 'Painting + Cleaning';
  }

  private isPaintingServiceType(serviceType: string): boolean {
    return serviceType === 'Painting' || serviceType === 'Painting + Cleaning';
  }
}
