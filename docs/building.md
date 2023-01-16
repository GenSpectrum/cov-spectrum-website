# Building

## For development

To build the application, the following environment variables are required:

- `REACT_APP_SERVER_HOST` - the URL to the [CoV-Spectrum API](https://github.com/GenSpectrum/cov-spectrum-server)
- `REACT_APP_LAPIS_HOST` - the URL to [LAPIS](https://github.com/GenSpectrum/LAPIS)
- `REACT_APP_WEBSITE_HOST` - the URL of the web app
- `REACT_APP_LAPIS_ACCESS_KEY` - the access key for the LAPIS server (only required if the API is protected)
- `REACT_APP_PPRETTY_HOST` - the URL to [ppretty](https://github.com/GenSpectrum/cov-spectrum-ppretty)

To run the frontend locally for development, create a `.env` file in the root directory, containing the following:

```
REACT_APP_SERVER_HOST=https://cov-spectrum.org/api/v2
REACT_APP_LAPIS_HOST=https://lapis.cov-spectrum.org/gisaid/v1
REACT_APP_WEBSITE_HOST=http://localhost:3000
REACT_APP_LAPIS_ACCESS_KEY=<key>
REACT_APP_PPRETTY_HOST=https://cov-spectrum.org/api/ppretty
```

And then run `npm run start`, which will automatically use these environment variables. You can also base it off from the `.env.example` file in the root.

Many new features and the majority of the open issues can be implemented by only changing the frontend code. In most cases, there is no need to set up the backend locally.

## For production

Production builds are done automatically in CI (see [.github/workflows/gisaid_docker.yml](/.github/workflows/gisaid_docker.yml)).
