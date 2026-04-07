import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { contactEmail, contactPhone } from './site-content';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly contactPhone = contactPhone;
  protected readonly contactEmail = contactEmail;
  protected readonly callHref = `tel:+1${contactPhone.replace(/[^0-9]/g, '')}`;
  protected servicesMenuOpen = false;

  protected handleLogoError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }

    image.onerror = null;
    image.src = '/images/eps-logo.svg';
  }

  protected toggleServicesMenu(event: Event): void {
    event.stopPropagation();
    this.servicesMenuOpen = !this.servicesMenuOpen;
  }

  protected closeServicesMenu(): void {
    this.servicesMenuOpen = false;
  }

  protected keepServicesMenuOpen(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  protected handleDocumentClick(): void {
    this.servicesMenuOpen = false;
  }
}
