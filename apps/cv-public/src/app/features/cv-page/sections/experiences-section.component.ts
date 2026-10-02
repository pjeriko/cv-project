import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Experience } from '@cv-project/shared-types';
import { MarkdownComponent } from '../../../shared/markdown/markdown.component';
import { itemDelay } from '../../../shared/animation/item-delay';

@Component({
  selector: 'app-experiences-section',
  imports: [DatePipe, MarkdownComponent],
  templateUrl: './experiences-section.component.html',
  host: { class: 'block h-full' },
})
export class ExperiencesSectionComponent {
  experiences = input.required<Experience[]>();

  readonly itemDelay = itemDelay;
}
