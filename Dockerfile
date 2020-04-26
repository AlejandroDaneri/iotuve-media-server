FROM node:13-alpine

RUN mkdir -p /src/app

WORKDIR /src/app

COPY package.json /src/app/package.json

RUN npm install

COPY . /src/app

CMD [ "npm", "start" ]