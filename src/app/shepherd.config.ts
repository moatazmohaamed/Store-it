import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';

@Injectable({
  providedIn: 'root',
})
export class ShepherdConfig {
  constructor(private shepherdService: ShepherdService) {
    this.shepherdService.defaultStepOptions = {
      classes: 'shepherd-theme-custom',
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
    };
  }

  initializeTour() {
    const steps = [
      {
        id: 'welcome',
        title: 'Welcome to Store-It',
        text: 'Let us guide you through the main features of our application.',
        buttons: [
          {
            text: 'Skip',
            action: this.shepherdService.cancel,
          },
          {
            text: 'Start Tour',
            action: this.shepherdService.next,
          },
        ],
      },
      // Add more steps as needed
    ];

    this.shepherdService.addSteps(steps);
  }
}
