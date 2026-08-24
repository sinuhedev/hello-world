FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY src ./src

RUN npm i

CMD node src/index.js