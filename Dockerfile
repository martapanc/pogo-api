FROM node:19

WORKDIR /app
COPY package.json ./
RUN yarn
COPY . .

RUN npx prisma generate
CMD ["yarn", "dev"]

