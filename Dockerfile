FROM node:14 AS BUILD

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . /usr/src/app
RUN yarn build

FROM node:14-alpine
LABEL maintainer="Ryan Owens <RyanOwens at linux.com>" org.label-schema.schema-version="1.0" org.label-schema.vendor="ryanowens" org.label-schema.name="ryanvade/base-express-template"
WORKDIR /app
COPY --from=BUILD /usr/src/app/dist /usr/src/app/package.json /usr/src/app/yarn.lock ./
RUN yarn install --production
EXPOSE 3000
USER 1000
ENV NODE_ENV "production"
CMD ["node", "/app/index.js"]