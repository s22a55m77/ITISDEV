FROM node:20.11.0

WORKDIR /usr/src/app/

USER root

COPY package.json ./

RUN npm i

COPY . ./

EXPOSE 3000

CMD ["npm", "run", "start"]
