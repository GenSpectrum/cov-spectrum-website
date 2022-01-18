# Building

## For development

To build the application, the following environment variables are required:

- `REACT_APP_SERVER_HOST` - the URL to the CoV-Spectrum API
- `REACT_APP_LAPIS_HOST` - the URL to LAPIS
- `REACT_APP_WEBSITE_HOST` - the URL of the web app

To run the frontend locally for development, but use the **production** server use:

```
env REACT_APP_SERVER_HOST=https://cov-spectrum.org/api/v2 \
    REACT_APP_LAPIS_HOST=https://lapis.cov-spectrum.org/gisaid/v1
    REACT_APP_WEBSITE_HOST=http://localhost:3000 \
    npm run start
```

Many new features and the majority of the open issues can be implemented by only changing the frontend code. In most cases, there is no need to set up the backend locally.

## For production

Production builds are done automatically in CI (see [.github/workflows/gisaid_docker.yml](/.github/workflows/gisaid_docker.yml)).
