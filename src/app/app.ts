import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = 'store-it';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  loadFlowbite(callback: (flowbite: any) => void): void {
    if (isPlatformBrowser(this.platformId)) {
      // Using dynamic import for better code splitting
      void import('flowbite')
        .then(flowbite => callback(flowbite))
        .catch(err => console.error('Failed to load Flowbite:', err));
    }
  }
}
