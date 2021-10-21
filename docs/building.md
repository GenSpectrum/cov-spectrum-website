# Building

## For development

To build the application, the following environment variables are required:

- `REACT_APP_SERVER_HOST` - the URL to the CoV-Spectrum API
- `REACT_APP_LAPIS_HOST` - the URL to LAPIS
- `REACT_APP_WEBSITE_HOST` - the URL of the web app

To run the frontend locally for development, but use the **production** server use:

```
env REACT_APP_SERVER_HOST=https://cov-spectrum.ethz.ch/api/v2 \
    REACT_APP_LAPIS_HOST=https://cov-spectrum.ethz.ch/gisaid/api/v1
    REACT_APP_WEBSITE_HOST=http://localhost:3000 \
    npm run start
```

## For production

Production builds are done automatically in CI (see [.github/workflows/docker.yml](/.github/workflows/docker.yml)).
