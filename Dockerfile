FROM node:8

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install --production
RUN npm install typescript
RUN npm run build-ts

EXPOSE 3000

CMD ["npm", "run", "serve:prod"]
