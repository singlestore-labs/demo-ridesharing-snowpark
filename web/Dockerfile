FROM node:22-alpine3.19 as build

WORKDIR /app
COPY . /app

ENV VITE_BACKEND_URL="http://localhost:8000"

RUN npm install
RUN npm run build

FROM nginx:1.25.2-alpine
COPY nginx.conf /etc/nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]