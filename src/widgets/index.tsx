import { VariantAgeDistributionPlotWidget } from './VariantAgeDistributionPlot';
import { VariantInternationalComparisonPlotWidget } from './VariantInternationalComparisonPlot';
import { VariantTimeDistributionPlotWidget } from './VariantTimeDistributionPlot';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { SequencingIntensityPlotWidget } from './SequencingIntensityPlot';
import { WasteWaterTimeWidget } from '../models/wasteWater/WasteWaterTimeWidget';
import { WasteWaterHeatMapWidget } from '../models/wasteWater/WasteWaterHeatMapWidget';
import { EstimatedCasesPlotWidget } from './EstimatedCasesPlot';
import { ArticleListWidget } from './ArticleList';
import { VariantDivisionDistributionTableWidget } from './VariantDivisionDistributionTable';
import { WasteWaterSummaryTimeWidget } from '../models/wasteWater/WasteWaterSummaryTimeWidget';
import { WasteWaterLocationTimeWidget } from '../models/wasteWater/WasteWaterLocationTimeWidget';

export const allWidgets = [
  VariantAgeDistributionPlotWidget,
  VariantInternationalComparisonPlotWidget,
  VariantTimeDistributionPlotWidget,
  VariantDivisionDistributionTableWidget,
  SequencingIntensityPlotWidget,
  Chen2021FitnessWidget,
  WasteWaterTimeWidget,
  WasteWaterHeatMapWidget,
  WasteWaterSummaryTimeWidget,
  WasteWaterLocationTimeWidget,
  EstimatedCasesPlotWidget,
  ArticleListWidget,
];
