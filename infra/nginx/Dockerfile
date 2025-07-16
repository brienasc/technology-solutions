FROM nginx:alpine

ADD infra/nginx/default.conf /etc/nginx/nginx.conf
ADD infra/nginx/fastcgi-php.conf /etc/nginx/

ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]