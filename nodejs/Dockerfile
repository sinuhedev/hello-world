FROM node:25-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i --omit=dev

COPY src ./src

CMD ["node", "--run","start"]