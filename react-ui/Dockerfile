# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY /public/background.jpeg .
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the React app with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]