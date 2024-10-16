import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { Chart, registerables } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

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
  @Input() chartType: 'bar' | 'line' | 'pie' | 'heatmap' = 'bar';
  private chart!: Chart<'bar' | 'line' | 'pie' | 'matrix'>;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    Chart.register(...registerables);
    Chart.register(MatrixController, MatrixElement);

    if (this.chartType === 'heatmap') {
      // Create heatmap chart using the `matrix` plugin
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'matrix', // 'matrix' is used to create a heatmap chart
        data: this.chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const value = context.raw;
                  return `Value: ${value}`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'category',
              labels: this.chartData.labels.x,
            },
            y: {
              type: 'category',
              labels: this.chartData.labels.y,
            },
          }
        }
      });
    } else {
      // Handle other chart types (bar, line, pie)
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
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
