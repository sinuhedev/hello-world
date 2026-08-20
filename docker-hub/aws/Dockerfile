FROM sinuhedev/base:latest
LABEL author="sinuhe.dev@gmail.com"

RUN apk add --no-cache aws-cli nodejs npm

COPY deploy /usr/local/bin/

RUN chmod +x /usr/local/bin/deploy

CMD ["bash"]