# Folders

The files in the `src` folder are roughly organized as follows:

- `components` - Most components; components that do not contain a chart and that are relatively small
- `data` - data fetching and transformation
  - See docs in [./api.md](./api.md) for details
- `helpers` - Most shared logic
- `models` - Special widgets which are very separate from the rest of the application
  - See [./models.md](./models.md) for more info
- `pages` - Components for "top level" pages
  - The docs in [./routing.md](./routing.md) might be relevant
- `services` - a collection of general services and utilities
- `widgets` - Sharable plots and tables with data loading logic
  - See [./widgets.md](./widgets.md) for info about writing and using widgets
