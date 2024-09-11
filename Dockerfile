FROM nginx:1.25.2-alpine

COPY nginx.conf /etc/nginx

EXPOSE 9000

CMD ["nginx", "-g", "daemon off;"]