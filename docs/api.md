# API

CoV-Spectrum uses two REST APIs. Genome sequence data are coming from [LAPIS](https://github.com/cevo-public/LAPIS) which is a general purpose API for querying sequencing data. LAPIS is being developed as an individual software. It is [documented here](https://lapis.cov-spectrum.org/). The frontend code makes requests to this API through functions in [src/data/api-lapis.ts](/src/data/api-lapis.ts).

In addition, CoV-Spectrum has an own and dedicated API. This API provides data that are specific to CoV-Spectrum. It includes case data, operations for login, etc. The code is in the [cov-spectrum-server repository](https://github.com/cevo-public/cov-spectrum-server). The frontend code makes requests to this API through functions in [src/data/api.ts](/src/data/api.ts).

**Note: LAPIS use the country names as they are provided by the underlying data source (GenBank, Nextstrain, or GISAID). CoV-Spectrum uses a different set of names. For example, GISAID writes "USA", but CoV-Spectrum uses "United States". The mapping of the country names is provided by the CoV-Spectrum API at endpoint `/resource/country`.**

## Types, `Dataset` and `Selector`

We distinguish between two types of data: general/shared/plot-unrelated data and plot-related data. All the code that are related to general data are in [src/data](/src/data). The general data are wrapped in `Dataset` objects. There are a few different types of Datasets: for example, `DetailedSampleAggDataset`, `DateCountSampleDataset`, `CaseCountDataset`. Each dataset has a `Selector` which is a set of filters. These are the filters that have been applied, i.e., all entries in the `payload` of a dataset fulfill the filters.

A Dataset can be directly fetched from the API and/or be derived from another Dataset. For example, we can derive a `DateCountSampleDataset` from `DetailedSampleAggDataset`.

## Authentication

Most API data is public and does not require an API key. See the [API doc](https://github.com/cevo-public/cov-spectrum-docs/blob/develop/API.md) for info about what does require a key ("private").

The helper functions in [src/data/api.ts](/src/services/api.ts) automatically attach an API if the user is logged in. In your code you may want to hide things or show warnings if a user isn't logged in. For this you can use `AccountService.isLoggedIn()`. Note that you don't have to listen for updates about the login state, since the application is fully reloaded after login and logout.
