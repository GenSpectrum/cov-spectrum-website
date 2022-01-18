# Plot libraries

There are two plot libraries that we use in CoV-Spectrum: [Recharts](https://recharts.org/en-US) and [Plotly](https://plotly.com/javascript/reference/). If you are not sure which one to use, use Recharts. It is easier to get custom features and match our application's style using Recharts. Plotly is very powerful and, e.g., supports zooming. However, it is difficult to customize and make it look very good.

## Recharts

We try to keep the plotting code separate from our data loading and transformation code. Recharts plotting code generally goes in [src/widgets](/src/widgets) (see [./folders.md](./folders.md)). You will find some useful example code in there.

## Plotly

You should use the wrapper component from [src/components/Plot.ts](/src/components/Plot.ts) instead of importing the equivalent component from the Plotly library directly.
