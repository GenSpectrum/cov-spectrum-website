import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { WasteWaterTimeWidget } from '../models/wasteWater/WasteWaterTimeWidget';
import { WasteWaterHeatMapWidget } from '../models/wasteWater/WasteWaterHeatMapWidget';
import { WasteWaterSummaryTimeWidget } from '../models/wasteWater/WasteWaterSummaryTimeWidget';
import { WasteWaterLocationTimeWidget } from '../models/wasteWater/WasteWaterLocationTimeWidget';
import { SequencingRepresentativenessChartWidget } from './SequencingRepresentativenessChartWidget';
import { MetadataAvailabilityChartWidget } from './MetadataAvailabilityChartWidget';
import { VariantTimeDistributionChartWidget } from './VariantTimeDistributionChartWidget';
import { VariantAgeDistributionChartWidget } from './VariantAgeDistributionChartWidget';
import { HospitalizationDeathChartWidget } from './HospitalizationDeathChartWidget';
import { SequencingIntensityChartWidget } from './SequencingIntensityChartWidget';
import { EstimatedCasesChartWidget } from './EstimatedCasesChartWidget';
import { VariantInternationalComparisonChartWidget } from './VariantInternationalComparisonChartWidget';
import { VariantDivisionDistributionChartWidget } from './VariantDivisionDistributionChartWidget';
import { Althaus2021GrowthWidget } from '../models/althaus2021Growth/Althaus2021GrowthWidget';

export const allWidgets = [
  EstimatedCasesChartWidget,
  HospitalizationDeathChartWidget,
  MetadataAvailabilityChartWidget,
  SequencingIntensityChartWidget,
  SequencingRepresentativenessChartWidget,
  VariantAgeDistributionChartWidget,
  VariantDivisionDistributionChartWidget,
  VariantInternationalComparisonChartWidget,
  VariantTimeDistributionChartWidget,
  Althaus2021GrowthWidget,
  Chen2021FitnessWidget,
  WasteWaterHeatMapWidget,
  WasteWaterLocationTimeWidget,
  WasteWaterSummaryTimeWidget,
  WasteWaterTimeWidget,
];
