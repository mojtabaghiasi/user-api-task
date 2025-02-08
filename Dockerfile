FROM node:20.11.1-alpine
RUN apk add --no-cache python3 make g++ build-base

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm ci --verbose

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD [  "npm", "run", "start:migrate:prod" ]