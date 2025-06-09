export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  dataLabels: ApexDataLabels;
};

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';
