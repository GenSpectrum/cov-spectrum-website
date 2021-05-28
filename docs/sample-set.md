# New samples endpoint and `SampleSet`

We used to have many separate API endpoints, each of which returned a transformed dataset that was very specific and could only be used to make one type of plot. For many cases we have now [switched](https://github.com/cevo-public/cov-spectrum-website/pull/78) to a new more generic endpoint.

## Concept of the API endpoint

The actual API endpoint (`/resource/sample2`) is described [here](https://github.com/cevo-public/cov-spectrum-docs/blob/develop/API.md#sample-new). It filters the SARS-CoV-2 sequences in our database, groups them by multiple fields (country, day, etc.), and returns the number of sequences in each group. By combining multiple results from this endpoint you can create many types of plots. For example by performing one query for a specific virus variant and another query without a variant filter, then dividing the counts returned from both queries, you get the proportion of sequences that belong to that variant.

## Helper function and `SampleSet`

To query this endpoint you should use the `getNewSamples` helper function from [src/services/api.ts](/src/services/api.ts) (see [./api.md](./api.md)). This function returns a `SampleSet` object. It contains helper functions for re-grouping, counting sequences, or calculating proportions. In most cases you should use these functions. Note that in most cases the `SampleSet` you need is **already loaded** - see the next section.

If you need something else for your use case, you can use `SampleSet.getAll` to get the individual groups of samples that were returned from the API. **Be careful** if you do this: each group (`ParsedMultiSample`) has a `count` field, since it represents multiple samples. If you forget to consider this field your results will be wrong.

## Centrally loaded sample sets

Most `getNewSamples` calls happen in [src/pages/ExploreFocusSplit.tsx](/src/pages/ExploreFocusSplit.tsx), because the data is needed by most components below. Specifically, 4 sample sets are loaded here:

- `variantSampleSet` - filtered by mutation and country
- `wholeSampleSet` - filtered by country
- `variantInternationalSampleSet` - filtered by mutation
- `wholeInternationalSampleSet` - not filtered

Most components will take variantSampleSet and wholeSampleSet, then use `SampleSet.proportionBy(Week|Field)` and `fillFrom(Weekly|Primitive)Map` to get data for plotting.

## Date handling

The dates in `SampleSet` are `UnifiedDay` and `UnifiedIsoWeek`. These come from the central date cache. See the documentation in [./date-cache.md](./date-cache.md).

## Widgets and async loading

`SampleSet` is designed to be used with async loaded widgets (see `./widgets.md` about the general topic of async widgets). Most sample sets in the application are `SampleSetWithSelector`. This can be encoded (for embed URLs) by saving the `sampleSelector` field. To decode the data from these URLs, use `getNewSamples` with the saved `sampleSelector`. Look at [src/widgets/VariantTimeDistributionPlot.tsx](/src/widgets/VariantTimeDistributionPlot.tsx) for an example of `SampleSetWithSelector` used with a widget.

## More details

There is a little more information about the new samples endpoint in the [original PR](https://github.com/cevo-public/cov-spectrum-website/pull/78).
