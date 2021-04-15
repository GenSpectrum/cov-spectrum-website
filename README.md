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
