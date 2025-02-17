FROM node:14

COPY api /app
WORKDIR /app

RUN npm install

ENV PORT=12345
ENV MONGO_URL=mongodb://localhost:28017

CMD ["npm", "start"]

#Dockerignore maken en versie 20 node