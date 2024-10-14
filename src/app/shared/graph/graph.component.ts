import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() chartData: any;
  @Input() chartType: 'bar' | 'line' | 'pie' = 'bar'; // Default to bar chart
  private chart!: Chart<'bar' | 'line' | 'pie', number[]>;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    Chart.register(...registerables);
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: this.chartType,
      data: this.chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
