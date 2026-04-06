import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { processSteps } from '../site-content';

@Component({
  selector: 'app-process-page',
  imports: [RouterLink],
  templateUrl: './process.page.html',
  styleUrl: './process.page.scss'
})
export class ProcessPage {
  protected readonly processSteps = processSteps;
  protected readonly qualityChecks = [
    'Daily walkthrough with progress notes',
    'Edge-detail and finish consistency check',
    'Protection reset and cleanup before handover',
    'Final review with homeowner or site manager'
  ];
}
