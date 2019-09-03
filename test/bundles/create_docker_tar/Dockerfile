FROM node:10.16-alpine

RUN mkdir /application
COPY index.js /application
COPY package.json /application

WORKDIR /application
RUN npm i --production

CMD ["node", "index.js"]