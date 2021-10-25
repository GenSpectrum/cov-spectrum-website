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

export type LocationDateSelector = {
  location: LocationSelector;
  dateRange?: DateRangeSelector;
};

export const LocationDateSelectorEncodedSchema = zod.object({
  location: LocationSelectorEncodedSchema,
  dateRange: DateRangeSelectorEncodedSchema.optional(),
});

export function encodeLocationDateSelector(
  selector: LocationDateSelector
): zod.infer<typeof LocationDateSelectorEncodedSchema> {
  return {
    location: encodeLocationSelector(selector.location),
    dateRange: selector.dateRange ? encodeDateRangeSelector(selector.dateRange) : undefined,
  };
}

export function decodeLocationDateSelector(
  encoded: zod.infer<typeof LocationDateSelectorEncodedSchema>
): LocationDateSelector {
  return {
    location: decodeLocationSelector(encoded.location),
    dateRange: encoded.dateRange ? decodeDateRangeSelector(encoded.dateRange) : undefined,
  };
}
