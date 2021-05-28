# Folders

The files in the `src` folder are roughly organized as follows:

- `components` - Most components
- `pages` - Components for "top level" pages
  - The docs in [./routing.md](./routing.md) might be relevant
- `charts` - Recharts plots
  - These don't do data loading and transformation themselves
- `widgets` - Sharable plots with data loading logic
  - See [./widgets.md](./widgets.md) for info about writing and using widgets
- `helpers` - Most shared logic
  - The other doc pages refer to most important files in here
- `services` - The most important file in here is `api.ts`
  - See [./api.md](./api.md) for more info about using the API
- `models` - Special widgets which are very separate from the rest of the application
  - See [./models.md](./models.md) for more info
