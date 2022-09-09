FROM node:18-alpine
WORKDIR /app
RUN npm i -g yarn --force
COPY package.json .
RUN yarn
COPY . .
EXPOSE 8080
CMD ["yarn", "dev"]