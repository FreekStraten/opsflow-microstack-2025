FROM node:20

COPY . /app
WORKDIR /app

RUN npm install

ENV PORT=12345
ENV MONGO_URL=mongodb://mijn-mongo:27017

CMD ["npm", "start"]

#Dockerignore maken en versie 20 node