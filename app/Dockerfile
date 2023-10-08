ARG build_type=default
ARG node=14.16-alpine

#
# Stage 0 - Base
#
FROM node:${node} AS base
ARG project
ARG version
ARG sentry_auth_token
ENV VERSION=$version
ENV SENTRY_AUTH_TOKEN=$sentry_auth_token
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock decorate-angular-cli.js ./
RUN yarn install
COPY ./ ./
RUN ./node_modules/.bin/sentry-cli releases new ${version} --finalize \
  && ./node_modules/.bin/sentry-cli releases set-commits ${version} --commit "getlabs-app/getlabs-app@${version}"

#
# Stage 1 - Default build type
#
# Builds a simple angular project through the angular CLI.
#
FROM base as build-default
ARG project
ARG version
RUN yarn ${project}:build -c=production \
  && ./node_modules/.bin/sentry-cli releases files ${version} upload-sourcemaps /app/dist/apps/${project} -x .js -x .map --rewrite --strip-common-prefix


#
# Stage 1 - SSR build type
#
# Builds an SSR compatible project through the angular CLI.
#
FROM base as build-ssr
ARG project
ARG version
RUN yarn ${project}:ssr:build:browser-bundle -c=production \
    && yarn ${project}:ssr:build:server-bundle -c=production \
    && yarn ng run ${project}:build-server -c=production \
    && ./node_modules/.bin/sentry-cli releases files ${version} upload-sourcemaps /app/dist/apps/${project}/browser -x .js -x .map --rewrite --strip-common-prefix \
    && ./node_modules/.bin/sentry-cli releases files ${version} upload-sourcemaps /app/dist/apps/${project}/ssr -x .js -x .map --rewrite --strip-common-prefix


#
# Stage 2 - Post build
#
# Handles common post build tasks such as uploading source maps to Sentry.io, and cleaning up sourcemaps from the image
#
FROM build-${build_type} AS post-build
ARG project
ARG version
RUN ./node_modules/.bin/sentry-cli releases finalize ${version} \
  && find /app/dist/apps/${project}/ -type f -name '*.map' -delete


#
# Stage 3 - Final image (ssr target)
#
# Copies over the compiled SSR app in to a fresh node based image, exposes the proper port, and sets the start command.
#
FROM node:${node} AS ssr
ARG project
RUN mkdir /app
WORKDIR /app
COPY --from=post-build /app/dist/apps/${project}/ssr/ ./ssr
COPY --from=post-build /app/dist/apps/${project}/browser/ ./browser
COPY --from=post-build /app/node_modules/ ./node_modules/
#RUN yarn install --production=true --frozen-lockfile --ignore-scripts --prefer-offline
EXPOSE 3000
CMD ["node", "./ssr/main.js"]


#
# Stage 3 - Final image (default target)
#
# Copies over the compiled app in to a fresh Nginx image
#
FROM nginx:1.18-alpine
ARG project
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./config/security_headers /etc/nginx/security_headers
RUN rm -rf /usr/share/nginx/html/*
COPY --from=post-build /app/dist/apps/${project}/ /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]
