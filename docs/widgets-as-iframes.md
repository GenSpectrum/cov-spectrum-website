# How to embed a widget as iframe?

Most of the plots and tables on CoV-Spectrum can be embedded into other websites as iframes. Click on the "Export"-button next to the plots, and then on "Embed widget" to get the iframe code for a particular widget. In following, we describe how the iframe URLs are encoded.

## General encoding

The content of an iframe is encoded in the `src`-URL. The URLs for the CoV-Spectrum widgets have the following structure:

`https://cov-spectrum.org/embed/<widget-name>?json=<widget-parameters>&sharedWidgetJson=<sharing-configurations>`

The `<widget-parameters>` and `<sharing-configurations>` are JSON objects encoded with `encodeURIComponent()`.

## Widget parameters

### Shared parameter objects

The following parameter objects are shared by many widgets:

#### LocationSelector

```
location: {
  region: string,
  country: string,
  devision: string
}
```

#### DateRangeSelector

```
{
  mode: "AllTimes" | "Y2020" | "Y2021" | "Past3M" | "Past6M"
}
OR
{
  dateRange: {
    dateFrom: date,
    dateTo: date
  }
}
```

#### VariantSelector

```
{
  pangoLineage: string,
  gisaidClade: string,
  nextstrainClade: string,
  aaMutations: [string],
  nucMutations: [string],
}
```

#### LocationDateSelector

```
{
  location: LocationSelector,
  dateRange: DateRangeSelector
}
```

#### LocationDateVariantSelector

```
{
  location: LocationSelector,
  dateRange: DateRangeSelector,
  variant: VariantSelector
}
```

### Publications and pre-prints

**Name:** ArticleListWidget

**Parameter object:**

```
{
  pangoLineage: string
}
```

###

**Name:** EstimatedCasesChartWidget

**Parameter object:**

```
LocationDateVariantSelector
```

### Hospitalization and death probabilities

**Name:** HospitalizationDeathChartWidget

**Parameter object:**

```
{
  sampleSet: LocationDateVariantSelector,
  field: "hospitalized" | "died",
  extendedMetrics: boolean,
  relativeToOtherVariants: boolean,
}
```

### Metadata availability

**Name:** MetadataAvailabilityChartWidget

**Parameter object:**

```
LocationDateSelector
```

### Sequencing intensity

**Name:** SequencingIntensityChartWidget

**Parameter object:**

```
LocationDateSelector
```

### Sequencing representativeness

**Name:** SequencingRepresentativenessChartWidget

**Parameter object:**

```
LocationDateSelector
```

### Age distribution

**Name:** VariantAgeDistributionChartWidget

**Parameter object:**

```
LocationDateVariantSelector
```

### Geographic distribution

**Name:** VariantDivisionDistributionChartWidget

**Parameter object:**

```
LocationDateVariantSelector
```

###

**Name:** VariantInternationalComparisonChartWidget

**Parameter object:**

```
{
  variantSelector: LocationDateVariantSelector,
  countries: countries[],
  logScale: boolean,
}
```

### Sequences over time

**Name:** VariantTimeDistributionChartWidget

**Parameter object:**

```
LocationDateVariantSelector
```

### Transmission fitness advantage estimation

**Name:** Chen2021FitnessWidget

**Parameter object:**

```
{
  location: LocationSelector,
  variant: VariantSelector
}
```

### Wastewater heat map

**Name:** WasteWaterHeatMapWidget

**Parameter object:**

```
{
  country: string,
  variantName: string,
  location: string,
}
```

### Wastewater location sumary

**Name:** WasteWaterLocationTimeWidget

**Parameter object:**

```
{
  country: string,
  location: string,
}
```

### Wastewater variant summary

**Name:** WasteWaterSummaryTimeWidget

**Parameter object:**

```
{
  country: string,
  variantName: string,
}
```

### Wastewater proportion over time

**Name:** WasteWaterTimeWidget

**Parameter object:**

```
{
  country: string,
  variantName: string,
  location: string,
}
```

## Sharing configurations

```
{
  originalPageUrl: string
}
```

The `originalPageUrl` refers to the page where the plot can be found on CoV-Spectrum. This is the URL where the user will be directed to when the user clicks on the CoV-Spectrum logo in the widget.
