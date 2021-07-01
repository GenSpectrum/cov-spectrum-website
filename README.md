# CoV-Spectrum - Website

[CoV-Spectrum](https://cov-spectrum.ethz.ch) is an interactive tool to analyze and discover variants of SARS-CoV-2. Details about the features and purpose of CoV-Spectrum can be found on the [About page](https://cov-spectrum.ethz.ch/about). Feature proposals, bug reports and other suggestions for improvements are very welcome. Please submit them through the [Issues function](https://github.com/cevo-public/cov-spectrum-website/issues) of this repository.

## Developer documentation

From a technical point of view, CoV-Spectrum is a React app that shows a lot of plots based on read-only data.

There is documentation about different technical aspects of this app in the [./docs](./docs) folder. These next few paragraphs link to parts of that documentation. If you don't want to read much doc, at least check the the list of gotchas ([./docs/gotchas.md](./docs/gotchas.md)).

There's a short guide on how to get the application running locally in [./docs/building.md](./docs/building.md).

There is a loose logic to how the source code folder is structured. See [./docs/folders.md](./docs/folders.md) for a guide.

No state management library (e.g. Redux) is used. Most data is in a generic format ([./docs/sample-set.md](./docs/sample-set.md)) which is loaded centrally and transformed per plot. Some more specialized data is loaded locally in components. In either case, data is fetched though API helper functions ([./docs/api.md](./docs/api.md)).

The plotting libraries that we use are Recharts and Plotly. See [./docs/plot-libraries.md](./docs/plot-libraries.md) for a bit more info.

There is a special setup that allows certain plots to be loaded standalone outside of the main app (embedded in IFrames). This widget system requires special care when passing props and loading data. It is documented in [./docs/widgets.md](./docs/widgets.md).

Certain models and analyses require very different data than the main application. They are slightly separated from the rest of the code. See [./docs/models.md](./docs/models.md).

There is also some miscellaneous documentation about date handling ([./docs/date-cache.md](./docs/date-cache.md)), routing ([./docs/routing.md](./docs/routing.md)) and export buttons ([./docs/export.md](./docs/export.md)).

## Sponsors

[![Vercel Sponsorship Logo](public/img/powered-by-vercel.svg)](https://vercel.com/?utm_source=cov-spectrum&utm_campaign=oss)
