## Build app ##

FROM node:18-buster AS builder
WORKDIR /build
ARG REACT_APP_LAPIS_ACCESS_KEY

COPY package.json .
COPY package-lock.json .
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm --quiet ci

COPY . .
RUN npm set progress=false && \
    npm config set depth 0 && \
    export REACT_APP_WEBSITE_HOST=https://cov-spectrum.org && \
    export REACT_APP_SERVER_HOST=https://cov-spectrum.org/api/v2 && \
    export REACT_APP_PPRETTY_HOST=https://cov-spectrum.org/api/ppretty && \
    export REACT_APP_LAPIS_HOST=https://lapis.cov-spectrum.org/gisaid/v2 && \
    export REACT_APP_ALTERNATIVE_SEQUENCE_DATA_SOURCE_URL=https://open.cov-spectrum.org && \
    npm --quiet run build


## Serve via nginx ##

FROM nginx:stable as server

COPY --from=builder /build/build /app
COPY docker_resources/nginx-cov-spectrum.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
