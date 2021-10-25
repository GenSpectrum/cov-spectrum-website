import {
  decodeVariantSelector,
  encodeVariantSelector,
  VariantSelector,
  VariantSelectorEncodedSchema,
} from './VariantSelector';
import {
  decodeLocationSelector,
  encodeLocationSelector,
  LocationSelector,
  LocationSelectorEncodedSchema,
} from './LocationSelector';
import {
  DateRangeSelector,
  DateRangeSelectorEncodedSchema,
  decodeDateRangeSelector,
  encodeDateRangeSelector,
} from './DateRangeSelector';
import * as zod from 'zod';

export type LocationDateVariantSelector = {
  location: LocationSelector;
  dateRange?: DateRangeSelector;
  variant?: VariantSelector;
};

export const LocationDateVariantSelectorEncodedSchema = zod.object({
  location: LocationSelectorEncodedSchema,
  dateRange: DateRangeSelectorEncodedSchema.optional(),
  variant: VariantSelectorEncodedSchema.optional(),
});

export function encodeLocationDateVariantSelector(
  selector: LocationDateVariantSelector
): zod.infer<typeof LocationDateVariantSelectorEncodedSchema> {
  return {
    location: encodeLocationSelector(selector.location),
    dateRange: selector.dateRange ? encodeDateRangeSelector(selector.dateRange) : undefined,
    variant: selector.variant ? encodeVariantSelector(selector.variant) : undefined,
  };
}

export function decodeLocationDateVariantSelector(
  encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>
): LocationDateVariantSelector {
  return {
    location: decodeLocationSelector(encoded.location),
    dateRange: encoded.dateRange ? decodeDateRangeSelector(encoded.dateRange) : undefined,
    variant: encoded.variant ? decodeVariantSelector(encoded.variant) : undefined,
  };
}
