import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Experience } from '@cv-project/shared-types';

@Component({
  selector: 'app-experiences-section',
  imports: [DatePipe],
  templateUrl: './experiences-section.component.html',
  host: { class: 'block h-full' },
})
export class ExperiencesSectionComponent {
  experiences = input.required<Experience[]>();
}
