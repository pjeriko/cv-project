import { Component, input } from '@angular/core';
import { Project } from '@cv-project/shared-types';
import { MarkdownComponent } from '../../../shared/markdown/markdown.component';

@Component({
  selector: 'app-projects-section',
  imports: [MarkdownComponent],
  templateUrl: './projects-section.component.html',
  host: { class: 'block h-full' },
})
export class ProjectsSectionComponent {
  projects = input.required<Project[]>();
}
