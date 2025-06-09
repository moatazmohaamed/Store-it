import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  CircularGaugeModule,
  ILoadedEventArgs,
  GaugeTheme,
  AnnotationsService,
  GradientService,
} from '@syncfusion/ej2-angular-circulargauge';

type ChartOptions = {
  axes: {
    startAngle: number;
    endAngle: number;
    radius: string;
    line: { width: number };
    majorTicks: { height: number };
    minorTicks: { height: number };
    labelStyle: { font: { size: string } };
    pointers: {
      value: number;
      radius: string;
      type: 'Range' | 'Needle' | 'Marker';
      pointerWidth: number;
      cap: { radius: number; border: { width: number } };
      needleTail: { length: string };
      color: string;
      animation: { enable: boolean };
    }[];
    annotations: any[];
    ranges: any[];
  }[];
};

@Component({
  selector: 'app-chart',
  imports: [CommonModule, CircularGaugeModule],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  providers: [AnnotationsService, GradientService],
})
export class Chart implements OnChanges {
  @Input() used!: BehaviorSubject<number>;
  totalMb: number = 2048;
  public percent = new BehaviorSubject<number>(0);

  public chartOptions!: ChartOptions;

  // Properties for the second Circular Gauge
  public selectedTheme: string = location.hash.split('/')[1];
  public annotations: any[] = [
    {
      description: 'Triangle',
      content: '<div class="triangle-up"></div>',
      angle: 270,
      zIndex: '1',
      radius: '33%',
    },
    {
      description: 'Current',
      content: '<div class="text" style="color:#84cbb5;">Current</div>',
      angle: 0,
      zIndex: '1',
      radius: '25%',
    },
    {
      description: '76.6%',
      content: '<div class="percentage" style="color:#84cbb5;">76.6%</div>',
      angle: 105,
      zIndex: '1',
      radius: '9%',
    },
    {
      description: '0',
      content: '<div style="font-size:22px;">0</div>',
      angle: 213,
      zIndex: '1',
      radius: '83%',
    },
    {
      description: '100',
      content: '<div style="font-size:22px;">100</div>',
      angle: 150,
      zIndex: '1',
      radius: '83%',
    },
  ];

  public animation: Object = {
    enable: false,
  };

  public ticks: Object = {
    height: 0,
  };

  public lineStyle: Object = {
    width: 0,
  };

  public linearGradient: Object = {
    startValue: '0%',
    endValue: '60%',
    colorStop: [
      { color: 'white', offset: '10%', opacity: 0.9 },
      { color: '#84cbb5', offset: '90%', opacity: 0.9 },
    ],
  };

  public labelStyle: Object = {
    format: '{value} %',
    font: {
      size: '0px',
    },
  };

  // New properties for the second gauge's dynamic data
  public secondGaugePointers: any[] = [
    {
      type: 'Marker',
      markerShape: 'Circle',
      animation: { enable: false },
      markerWidth: 30,
      markerHeight: 30,
      radius: '82%',
      color: '#bdbdbf',
      value: 30,
    },
    {
      type: 'Marker',
      markerShape: 'Circle',
      animation: { enable: false },
      markerWidth: 30,
      markerHeight: 30,
      radius: '82%',
      color: '#626866',
      value: 50,
    },
    {
      type: 'Marker',
      markerShape: 'InvertedTriangle',
      markerWidth: 30,
      markerHeight: 30,
      radius: '92%',
      color: '#b6b6b6',
      value: 76.6, // This value will be updated
    },
  ];

  public secondGaugeRanges: any[] = [
    {
      start: 0,
      end: 100,
      startWidth: 30,
      endWidth: 30,
      color: '#e3e3e3',
      radius: '90%',
      roundedCornerRadius: 20,
    },
    {
      start: 30,
      end: 50,
      startWidth: 30,
      endWidth: 30,
      linearGradient: this.linearGradient,
      radius: '90%', // This end value will be updated
    },
  ];

  public loadGauge(args: ILoadedEventArgs): void {
    // custom code start
    this.selectedTheme = this.selectedTheme ? this.selectedTheme : 'Material';
    args.gauge.theme = <GaugeTheme>(
      this.selectedTheme.charAt(0).toUpperCase() + this.selectedTheme.slice(1)
    )
      .replace(/-dark/i, 'Dark')
      .replace(/contrast/i, 'Contrast')
      .replace(/-high/i, 'High')
      .replace(/5.3/i, '5');

    // Add null checks for axes and annotations
    if (
      args.gauge.axes &&
      args.gauge.axes.length > 0 &&
      args.gauge.axes[0].annotations
    ) {
      if (
        this.selectedTheme.indexOf('dark') > -1 ||
        this.selectedTheme.indexOf('contrast') > -1
      ) {
        args.gauge.axes[0].annotations[3].content =
          '<div style="font-size:22px;color:white;">0</div>';
        args.gauge.axes[0].annotations[4].content =
          '<div style="font-size:22px;color:white;">100</div>';
      } else {
        args.gauge.axes[0].annotations[3].content =
          '<div style="font-size:22px;">0</div>';
        args.gauge.axes[0].annotations[4].content =
          '<div style="font-size:22px;">100</div>';
      }
    }
    // custom code end
  }

  get usedMb(): number {
    if (typeof this.used !== 'number' || isNaN(this.used) || this.used <= 0) {
      return 0;
    }
    const usedBytes = this.used; // Assuming 'used' is in bytes
    const totalBytes = this.totalMb * 1024 * 1024; // Convert totalMb to bytes
    this.percent.next((usedBytes / totalBytes) * 100);
    return usedBytes / (1024 * 1024);
  }

  formatFileSize(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0 MB';
    }
    return `${value.toFixed(1)} MB`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['used']) {
      let currentValue = 0;
      if (this.used instanceof BehaviorSubject) {
        currentValue = this.used.value;
      } else if (typeof this.used === 'number') {
        currentValue = this.used;
      }

      const usedBytes = currentValue;
      const totalBytes = this.totalMb * 1024 * 1024;
      const percentage = (usedBytes / totalBytes) * 100;
      this.percent.next(parseFloat(percentage.toFixed(2)));

      // Update chartOptions for the first gauge
      this.chartOptions = {
        axes: [
          {
            startAngle: 200,
            endAngle: 140,
            radius: '100%',
            line: {
              width: 0,
            },
            majorTicks: {
              height: 0,
            },
            minorTicks: {
              height: 0,
            },
            labelStyle: {
              font: {
                size: '0px',
              },
            },
            pointers: [
              {
                value: this.percent.value,
                radius: '80%',
                type: 'Range',
                pointerWidth: 10,
                cap: {
                  radius: 0,
                  border: {
                    width: 0,
                  },
                },
                needleTail: {
                  length: '0%',
                },
                color: '#ffffff',
                animation: {
                  enable: false,
                },
              },
            ],
            ranges: [
              {
                start: 0,
                end: 100,
                radius: '80%',
                startWidth: 10,
                endWidth: 10,
                color: 'rgba(255,255,255, 0.3)',
              },
            ],
            annotations: [
              {
                content: `<div style='color:#ffffff; font-size:18px;'>${this.percent.value.toFixed(
                  2
                )}%</div>`,
                angle: 0,
                zIndex: '1',
                radius: '0%',
              },
            ],
          },
        ],
      };

      // Update properties for the second gauge
      // Update the percentage annotation
      if (this.annotations && this.annotations[2]) {
        this.annotations[2].content = `<div class="percentage" style="color:#84cbb5;">${this.percent.value.toFixed(
          2
        )}%</div>`;
      }

      // Update the value of the third pointer (index 2) in secondGaugePointers
      if (this.secondGaugePointers && this.secondGaugePointers[2]) {
        this.secondGaugePointers[2].value = parseFloat(
          this.percent.value.toFixed(2)
        );
      }

      // Update the end value of the second range (index 1) in secondGaugeRanges
      if (this.secondGaugeRanges && this.secondGaugeRanges[1]) {
        this.secondGaugeRanges[1].end = parseFloat(
          this.percent.value.toFixed(2)
        );
      }
    }
  }
}
