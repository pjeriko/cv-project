import { Component, input } from '@angular/core';
import { Project } from '@cv-project/shared-types';

@Component({
  selector: 'app-projects-section',
  templateUrl: './projects-section.component.html',
  host: { class: 'block h-full' },
})
export class ProjectsSectionComponent {
  projects = input.required<Project[]>();
}
