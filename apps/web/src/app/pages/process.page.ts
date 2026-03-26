import { Component } from '@angular/core';
import { processSteps } from '../site-content';

@Component({
  selector: 'app-process-page',
  imports: [],
  templateUrl: './process.page.html',
  styleUrl: './process.page.scss'
})
export class ProcessPage {
  protected readonly processSteps = processSteps;
}
