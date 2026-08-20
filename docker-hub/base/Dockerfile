FROM alpine:3.21
LABEL author="sinuhe.dev@gmail.com"

# localtime
RUN apk add --no-cache tzdata
RUN cp /usr/share/zoneinfo/America/Mexico_City /etc/localtime

# util
RUN apk add --no-cache bash curl git

# clean
RUN apk del tzdata

CMD ["bash"]
