import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { results } from '../site-content';

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss'
})
export class ProjectsPage {
  protected readonly results = results;
  protected readonly projectProofPoints = [
    { value: 'Prep-First', label: 'Surface prep before every finish coat' },
    { value: 'Daily Update', label: 'Clear progress updates during active work' },
    { value: 'Final Walkthrough', label: 'Joint inspection before closeout' }
  ];
  protected readonly fallbackImageUrl = '/images/placeholder-painting.svg';

  protected handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }

    image.onerror = null;
    image.src = this.fallbackImageUrl;
  }
}
