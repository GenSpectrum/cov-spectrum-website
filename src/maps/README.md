# Prevalence division maps

Each country division has it's own SVG shape and corresponding name. These are stored in the `country.json` files in this folder. Sometimes the API division names and the ones in the .json don't correspond, so we have to fix them by editing the division name in the .json file (one time fix per country division, it's harder to change the API).

## Adding countries

1. Download relevant map from https://react-vector-maps.netlify.app/maps
   These are json files generated from SVG.
2. Add the .json file to this `/maps` folder.
3. Include the name of the country in the `VariantDivisionDistributionChart.tsx`'s `countriesWithMaps` variable so that the map is opened instead of showing a list.
4. Rename the divisions in the json file to correspond to the fetched data division names.

Warning: This does not work when the country divisions are cities, since the available maps are divided by provinces.
