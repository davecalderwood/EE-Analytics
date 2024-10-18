import { ChartData, Point } from 'chart.js';

export interface CharacterKPI {
    characterName: string;
    averagePlayPercentage: number;
    characterColor: string;
    leaderPercentage?: string;
}

export interface CustomScatterChartData extends ChartData<'scatter', (number | Point | null)[], unknown> {
    axisLabels: {
        x: string;
        y: string;
    };
}