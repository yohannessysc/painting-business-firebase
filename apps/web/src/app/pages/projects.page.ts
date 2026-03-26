import { Component } from '@angular/core';
import { results } from '../site-content';

@Component({
  selector: 'app-projects-page',
  imports: [],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss'
})
export class ProjectsPage {
  protected readonly results = results;
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
