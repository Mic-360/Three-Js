FROM node:18.9.0-bullseye-slim
WORKDIR /app
RUN npm install -g yarn --force
RUN yarn cache clean
COPY package.json .
RUN yarn
COPY . .
CMD ["yarn", "dev"]
EXPOSE 8080