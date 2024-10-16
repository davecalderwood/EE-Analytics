import 'chart.js';

declare module 'chart.js' {
    interface ChartTypeRegistry {
        matrix: {
            // Define what kind of data `matrix` expects; 
            // usually, it's two-dimensional data, so this is just an example:
            chartOptions: ChartOptions<'matrix'>;
            datasetOptions: {};
            defaultDataPoint: any; // Change this to the expected data point type
            metaExtensions: {};
            parsedDataType: number;
            scales: {
                x: {
                    labels?: string[];
                },
                y: {
                    labels?: string[];
                }
            };
        };
    }
}
