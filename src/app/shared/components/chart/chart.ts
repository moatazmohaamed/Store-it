import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChange, SimpleChanges, } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexPlotOptions,
  ApexResponsive,
  ApexDataLabels,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { BehaviorSubject } from 'rxjs';

type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  dataLabels: ApexDataLabels;
};;

@Component({
  selector: 'app-chart',
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart implements OnChanges {
  @Input() used!: BehaviorSubject<number>;
  totalMb: number = 2048;
  public percent = new BehaviorSubject<number>(0);

  public chartOptions!: ChartOptions;

  get usedMb(): number {
    if (typeof this.used !== 'number' || isNaN(this.used) || this.used <= 0) {
      return 0;
    }
    this.percent.next((this.used / (this.totalMb * 1024 * 1024)) * 100);
    return this.used / (1024 * 1024);
  }

  formatFileSize(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0 MB';
    }
    return `${value.toFixed(1)} MB`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['used']) {
      this.chartOptions = {
        series: [parseFloat(this.percent.value.toFixed(2))],
        chart: {
          type: 'radialBar',
          height: 200,
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '60%',
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: '14px',
                color: '#fffff1',
              },
              value: {
                formatter: () => `${this.percent.value.toFixed(2)}%`,
                fontSize: '18px',
                color: '#ffffff',
              },
            },
          },
        },
        fill: {
          colors: ['#ffffff'],
        },
        stroke: {
          lineCap: 'round',
        },
        labels: ['Space Used'],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 200,
              },
            },
          },
        ],
        dataLabels: {
          enabled: true,
        },
      };
    }
  }
}
