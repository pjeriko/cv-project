import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Education } from '@cv-project/shared-types';
import { itemDelay } from '../../../shared/animation/item-delay';

@Component({
  selector: 'app-educations-section',
  imports: [DatePipe],
  templateUrl: './educations-section.component.html',
  host: { class: 'block h-full' },
})
export class EducationsSectionComponent {
  educations = input.required<Education[]>();

  readonly itemDelay = itemDelay;
}
