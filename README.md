# CoV-Spectrum

[CoV-Spectrum](https://cov-spectrum.org) is an interactive tool to analyze and discover variants of SARS-CoV-2. Details about the features and purpose of CoV-Spectrum can be found on the [About page](https://cov-spectrum.ethz.ch/about). Feature proposals, bug reports and other suggestions for improvements are very welcome. Please submit them through the [Issues function](https://github.com/cevo-public/cov-spectrum-website/issues) of this repository.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/chaoran-chen"><img src="https://avatars.githubusercontent.com/u/18666552?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chaoran Chen</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=chaoran-chen" title="Code">💻</a> <a href="#data-chaoran-chen" title="Data">🔣</a> <a href="#ideas-chaoran-chen" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-chaoran-chen" title="Maintenance">🚧</a> <a href="#platform-chaoran-chen" title="Packaging/porting to new platform">📦</a> <a href="#research-chaoran-chen" title="Research">🔬</a> <a href="#infra-chaoran-chen" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/tanja819"><img src="https://avatars.githubusercontent.com/u/8371380?v=4?s=100" width="100px;" alt=""/><br /><sub><b>tanja819</b></sub></a><br /><a href="#ideas-tanja819" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/SarahNadeau"><img src="https://avatars.githubusercontent.com/u/30396464?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sarah Nadeau</b></sub></a><br /><a href="#ideas-SarahNadeau" title="Ideas, Planning, & Feedback">🤔</a> <a href="#data-SarahNadeau" title="Data">🔣</a></td>
    <td align="center"><a href="https://github.com/TKGZ"><img src="https://avatars.githubusercontent.com/u/36269621?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Yared</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=TKGZ" title="Code">💻</a></td>
    <td align="center"><a href="https://walr.is/"><img src="https://avatars.githubusercontent.com/u/1489115?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Philippe Voinov</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=tehwalris" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ningxie1991"><img src="https://avatars.githubusercontent.com/u/3387698?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ningxie</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=ningxie1991" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/corneliusroemer"><img src="https://avatars.githubusercontent.com/u/25161793?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cornelius Roemer</b></sub></a><br /><a href="#ideas-corneliusroemer" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/DrYak"><img src="https://avatars.githubusercontent.com/u/11413679?v=4?s=100" width="100px;" alt=""/><br /><sub><b>DrYak</b></sub></a><br /><a href="#data-DrYak" title="Data">🔣</a></td>
    <td align="center"><a href="https://github.com/gautier-collab"><img src="https://avatars.githubusercontent.com/u/55604970?v=4?s=100" width="100px;" alt=""/><br /><sub><b>gautier-collab</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=gautier-collab" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dameyerdave"><img src="https://avatars.githubusercontent.com/u/5663605?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David Meyer</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=dameyerdave" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/anastasia-escher"><img src="https://avatars.githubusercontent.com/u/52914023?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anastasia Escher</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=anastasia-escher" title="Code">💻</a></td>
    <td align="center"><a href="http://theo.io/"><img src="https://avatars.githubusercontent.com/u/19732295?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Theo Sanderson</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=theosanderson" title="Code">💻</a> <a href="#ideas-theosanderson" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/adrian-lison"><img src="https://avatars.githubusercontent.com/u/16266527?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adrian Lison</b></sub></a><br /><a href="https://github.com/cevo-public/cov-spectrum-website/commits?author=adrian-lison" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Developer documentation

From a technical point of view, CoV-Spectrum's frontend is a React app that shows a lot of plots based on read-only data. It depends on the [CoV-Spectrum server](https://github.com/cevo-public/cov-spectrum-server) for all but sequence data and on [LAPIS](https://github.com/cevo-public/LAPIS) for the sequence data. Please check out the corresponding repositories for instructions on how to set up the server applications. A short guide on how to get the frontend application running locally is in [./docs/building.md](./docs/building.md).

```mermaid
flowchart TB;
    subgraph frontend["CoV-Spectrum frontend (React)"]
        frontend_stuff["Plotting, data transformation, data fetching, UI, etc."]
    end
    
    subgraph backend["CoV-Spectrum backend"]
        direction TB
        subgraph backend_app["Kotlin application"]
            direction TB
            collections[Collections API]
            cases[Case data API]
        end
        backend_db[PostgreSQL]
        backend_app --- backend_db
    end
    
    subgraph lapis_server["LAPIS server"]
        direction TB
        subgraph lapis_app[Java application]
            direction TB
            lapis_api[REST-API]
            lapis_engine["Query engine"]
        end
        lapis_db["Background storage (PostgreSQL)"]
        lapis_app --- lapis_db
    end
    
    subgraph lapis_proc["LAPIS pre-processing (batch job)"]
        step1["Step 1: alignment, translations, cleaning, etc."]
        step2["Step 2: LAPIS-specific"]
    end
    
    frontend --- backend
    frontend --- lapis_server
    lapis_proc --> lapis_server
```

There is documentation about different technical aspects of this app in the [./docs](./docs) folder. These next few paragraphs link to parts of that documentation. If you don't want to read much doc, at least check the the list of gotchas ([./docs/gotchas.md](./docs/gotchas.md)).

There is a loose logic to how the source code folder is structured. See [./docs/folders.md](./docs/folders.md) for a guide.

No state management library (e.g. Redux) is used. Most data is in a generic format which is loaded centrally and transformed per plot. Some more specialized data is loaded locally in components. In either case, data is fetched though API helper functions ([./docs/api.md](./docs/api.md)).

The plotting libraries that we use are Recharts and Plotly. See [./docs/plot-libraries.md](./docs/plot-libraries.md) for a bit more info.

There is a special setup that allows certain plots to be loaded standalone outside of the main app (embedded in IFrames). This widget system requires special care when passing props and loading data. It is documented in [./docs/widgets.md](./docs/widgets.md).

Certain models and analyses require very different data than the main application. They are slightly separated from the rest of the code. See [./docs/models.md](./docs/models.md).

There is also some miscellaneous documentation about date handling ([./docs/date-cache.md](./docs/date-cache.md)), routing ([./docs/routing.md](./docs/routing.md)), export buttons ([./docs/export.md](./docs/export.md)) and styling ([./docs/styling.md](./docs/styling.md)).

## Sponsors

[![Vercel Sponsorship Logo](public/img/powered-by-vercel.svg)](https://vercel.com/?utm_source=cov-spectrum&utm_campaign=oss)
