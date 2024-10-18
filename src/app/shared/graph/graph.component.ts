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
  @Input() chartType: 'bar' | 'line' | 'pie' | 'heatmap' | 'scatter' = 'bar';
  private chart!: Chart<'bar' | 'line' | 'pie' | 'matrix' | 'scatter'>;
  @Input() axisLabels!: { x: string, y: string };

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    Chart.register(...registerables);

    // Create the chart based on the chartType
    switch (this.chartType) {
      case 'scatter':
        // Create scatter plot chart
        this.scatterGraph();
        break;

      case 'heatmap':
        // Add heatmap chart configuration here
        // Example:
        // this.chart = new Chart(this.chartCanvas.nativeElement, {
        //     type: 'matrix',
        //     data: this.chartData,
        //     options: {
        //         // Add heatmap specific options
        //     }
        // });
        break;

      default:
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
        break;
    }
  }

  private scatterGraph() {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'scatter',
      data: {
        datasets: this.chartData.datasets // Use the datasets from chartData
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const xLabel = context.raw?.x; // Safely access x
                const yLabel = context.raw?.y; // Safely access y

                if (xLabel !== undefined && yLabel !== undefined) {
                  return `X: ${xLabel}, Y: ${yLabel}`;
                } else {
                  return 'Data not available'; // Handle undefined case
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: this.chartData.axisLabels.x // Use axisLabels for titles
            }
          },
          y: {
            title: {
              display: true,
              text: this.chartData.axisLabels.y // Use axisLabels for titles
            }
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.data = this.chartData;
      this.chart.update(); // Call Chart.js update method
    } else {
      this.createChart(); // Fallback to create the chart if it doesn't exist
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
