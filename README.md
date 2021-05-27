# CoV-Spectrum - Website

This repository is home to the website (frontend application) of [CoV-Spectrum](https://cov-spectrum.ethz.ch) - an interactive tool to analyze and discover variants of SARS-CoV-2. Details about the features and purpose of CoV-Spectrum can be found on the [About page](https://cov-spectrum.ethz.ch/about). Feature proposals, bug reports and other suggestions for improvements are very welcome. Please submit them through the [Issues function](https://github.com/cevo-public/cov-spectrum-website/issues) of this repository.

## Development

To build the application, the following environment variables are required:

- REACT_APP_SERVER_HOST
- REACT_APP_WEBSITE_HOST

To run the frontend locally for development, but use the **production** server use:

```
env REACT_APP_SERVER_HOST=https://cov-spectrum.ethz.ch/api REACT_APP_WEBSITE_HOST=http://localhost:3000 npm run start
```

## Developer documentation

From a technical point of view, CoV-Spectrum is a React app that shows a lot of plots based on read-only data.

There is documentation about different technical aspects of this app in the [docs](./docs) folder. These next few paragraphs link to parts of that documentation.

There is a loose logic to [how the source code folder is structured](./folders.md).

No state management library (eg. Redux) is used. Most data is in a [generic format](./docs/sample-set.md) which is loaded centrally and transformed per plot. Some more specialized data is loaded locally in components. In either case, data is fetched though [API helper functions](./docs/api.md).

The [plotting libraries that we use](./docs/plot-libraries.md) are Recharts and Plotly.

There is a special setup that allows certain plots to be loaded standalone outside of the main app (embedded in IFrames). This [widget system](./docs/widgets.md) requires special care when passing props and loading data.

Certain [models](./docs/models.md) and analyses require very different data than the main application. They are slightly separated from the rest of the code.

There is also some miscellaneous documentation about [date handling](./docs/date-cache.md), [authentication](./docs/auth.md) and [routing](./docs/routing.md).

Check the [list of gotchas](./docs/gotchas.md) - it might save you some time in the future.
