FROM --platform=$BUILDPLATFORM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.25.2-alpine
COPY nginx.conf /etc/nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]