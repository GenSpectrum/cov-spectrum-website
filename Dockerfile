## Build app ##

FROM node:14-buster AS builder
WORKDIR /build

COPY package.json .
COPY package-lock.json .
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm --quiet ci

COPY . .
# TODO: Update REACT_APP_WEBSITE_HOST
RUN npm set progress=false && \
    npm config set depth 0 && \
    export REACT_APP_WEBSITE_HOST=http://localhost:3030 && \
    export REACT_APP_SERVER_HOST=/api && \
    npm --quiet run build


## Serve via nginx ##

FROM nginx:stable as server

COPY --from=builder /build/build /app
COPY docker_resources/nginx-variant-monitor.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
