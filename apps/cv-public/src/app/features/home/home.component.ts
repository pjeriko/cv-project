import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  host: { class: 'block h-screen' },
})
export class HomeComponent {}
