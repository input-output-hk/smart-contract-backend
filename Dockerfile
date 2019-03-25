FROM node:10.15.3-alpine as builder
RUN apk add --update git python krb5 krb5-libs gcc make g++ krb5-dev
RUN mkdir /application
COPY . /application
WORKDIR /application
RUN rm .env
RUN npm i
RUN npm run build

FROM node:10.15.3-alpine as test
COPY --from=builder /application /application
WORKDIR /application
CMD ["npm", "test"]

FROM node:10.15.3-alpine as production-deps
RUN apk add --update git python krb5 krb5-libs gcc make g++ krb5-dev
RUN mkdir /application
COPY package.json /application/package.json
WORKDIR /application
RUN npm i --production

FROM node:10.15.3-alpine as server
RUN mkdir /application
COPY --from=builder /application/dist/server /application/dist/server
COPY --from=production-deps /application/node_modules /application/node_modules
CMD ["node" , "/application/dist/server/index.js"]

FROM node:10.15.3-alpine as docker_execution
RUN mkdir /application
RUN mkdir /application/docker
COPY --from=builder /application/dist/execution_engines/docker /application/dist/execution_engines/docker
COPY --from=builder /application/dist/swagger.json /application/dist/swagger.json
COPY --from=production-deps /application/node_modules /application/node_modules
CMD ["node", "/application/dist/execution_engines/docker/index.js"]