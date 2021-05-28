# Date cache

Since our application deals with lots of time series data and presents it in multiple ways, we have to perform lots of date operations and use multiple date formats. In some cases date conversions and validation can even become a bottleneck.

There is a centralized system to speed up date conversions and other operations in [src/helpers/date-cache.ts](/src/helpers/date-cache.ts). It provides `UnifiedDay` and `UnifiedIsoWeek` objects which can be managed through `globalDateCache`. This system is used in most code, although not 100% consistently. You should definitely try to use it in new code.

A `UnifiedDay` object represents a single day and contains multiple representations of it (e.g. as `Dayjs`). `UnifiedIsoWeek` is the equivalent for weeks, which are used quite a lot in CoV-Spectrum. Days and weeks are linked to each other through `isoWeek` and `firstDay` fields for fast lookups.

You can get a `UnifiedDay` or `UnifiedIsoWeek` by calling `globalDateCache.getDay` or `globalDateCache.getIsoWeek`. This is cheap from the second call for the same date, which really helps for our use case. If you are using `SampleSet` (see [./sample-set.md](./sample-set.md)) it already gets these objects from the date cache.

`UnifiedDay` objects will be reference equal (`===`) if they represent the same day. The same holds for `UnifiedIsoWeek`. This allows using these objects as keys for `Map` or `Set` instead of using specially formatted strings. Note that you **must use `globalDateCache`** for this to work - do _not_ call `new DateCache()` yourself, except in tests.
