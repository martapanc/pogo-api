FROM node:19

WORKDIR /app

COPY package.json ./
COPY . .
COPY .env.docker ./.env

RUN yarn

RUN npx prisma generate
#RUN yarn db:migrate
#RUN yarn db:seed

#CMD ["wait-for-it", "postgres:5432", "--", "yarn", "db:migrate"]

CMD ["yarn", "dev"]


