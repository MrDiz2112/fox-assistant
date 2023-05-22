FROM node:lts as builder

WORKDIR /app

COPY . .

RUN npm install &&  \
    npm run build

FROM node:lts as production

WORKDIR /app

COPY --from=builder ./app/locales ./locales
COPY --from=builder ./app/dist ./dist
COPY package.json .

RUN npm install --production

CMD ["npm", "start"]
