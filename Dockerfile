FROM node:10.15.3-alpine as builder
RUN apk add --update git python krb5 krb5-libs gcc make g++ krb5-dev
RUN mkdir /application
COPY package.json /application/package.json
WORKDIR /application
RUN npm i
COPY . /application
RUN npm run build

FROM node:10.15.3-alpine as test
COPY --from=builder /application /application
WORKDIR /application
CMD ["npm", "test"]

FROM node:10.15.3-alpine as production_deps
RUN apk add --update git python krb5 krb5-libs gcc make g++ krb5-dev
RUN mkdir /application
COPY package.json /application/package.json
WORKDIR /application
RUN npm i --production

FROM node:10.15.3-alpine as server
RUN mkdir /application
COPY --from=builder /application/src /application/src
COPY --from=builder /application/dist/core /application/dist/core
COPY --from=builder /application/dist/lib /application/dist/lib
COPY --from=builder /application/dist/execution_service /application/dist/execution_service
COPY --from=builder /application/dist/server /application/dist/server
COPY --from=builder /application/webpack.config.js /application/webpack.config.js
COPY --from=builder /application/tsconfig.json /application/tsconfig.json
COPY --from=builder /application/node_modules /application/node_modules
WORKDIR /application
CMD ["./node_modules/.bin/pm2", "--no-daemon", "start", "dist/server/index.js"]

FROM node:10.15.3-alpine as execution_service
RUN mkdir /application
RUN mkdir /application/docker
COPY --from=builder /application/src /application/src
COPY --from=builder /application/dist/core /application/dist/core
COPY --from=builder /application/dist/lib /application/dist/lib
COPY --from=builder /application/dist/execution_service /application/dist/execution_service
COPY --from=builder /application/puppeteer_evaluater.js /application/puppeteer_evaluater.js
COPY --from=builder /application/dist/swagger.json /application/dist/swagger.json
COPY --from=production_deps /application/node_modules /application/node_modules
WORKDIR /application
CMD ["./node_modules/.bin/pm2", "--no-daemon", "start", "dist/execution_service/index.js"]