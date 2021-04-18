import { VariantAgeDistributionPlotWidget } from './VariantAgeDistributionPlot';
import { VariantInternationalComparisonPlotWidget } from './VariantInternationalComparisonPlot';
import { VariantTimeDistributionPlotWidget } from './VariantTimeDistributionPlot';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { SequencingIntensityPlotWidget } from './SequencingIntensityPlot';
import { WasteWaterTimeWidget } from '../models/wasteWater/WasteWaterTimeWidget';
import { WasteWaterHeatMapWidget } from '../models/wasteWater/WasteWaterHeatMapWidget';

export const allWidgets = [
  VariantAgeDistributionPlotWidget,
  VariantInternationalComparisonPlotWidget,
  VariantTimeDistributionPlotWidget,
  SequencingIntensityPlotWidget,
  Chen2021FitnessWidget,
  WasteWaterTimeWidget,
  WasteWaterHeatMapWidget,
];
