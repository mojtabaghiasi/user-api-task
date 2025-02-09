FROM node:20.11.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm ci --verbose

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD [  "npm", "run", "start:migrate:prod" ]