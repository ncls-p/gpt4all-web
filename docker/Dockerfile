FROM node:18.10.0-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn install

COPY . .

CMD [ "yarn", "start" ]
