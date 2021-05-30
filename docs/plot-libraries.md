# Plot libraries

There are two plot libraries that we use in CoV-Spectrum: [Recharts](https://recharts.org/en-US) and [Plotly](https://plotly.com/javascript/reference/). If you are not sure which one to use, use Recharts. It is easier to get custom features and match our application's style using Recharts. Plotly is useful for quick charts which don't need to look perfect.

## Recharts

We try to keep the plotting code separate from our data loading and transformation code. Recharts plotting code generally goes in [src/charts](/src/charts) (see [./folders.md](./folders.md)). You will find some useful example code in there.

## Plotly

You should use the wrapper component from [src/components/Plot.ts](/src/components/Plot.ts) instead of importing the equivalent component from the Plotly library directly.

- Originally plotly
  - Use src/components/Plot.ts
- Now more Recharts
  - Separation of loading and transformation from plotting
  - Plotting mostly done in src/charts
