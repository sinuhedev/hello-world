# nginx

# Self-Signed
```sh
openssl req -x509 -nodes -newkey rsa:2048 -keyout ssl/localhost.key -out ssl/localhost.crt -days 9999 \
-subj "/C=MX/ST=Ciudad de Mexico/L=Ciudad de Mexico/O=localhost/OU=localhost/CN=localhost"
```

# web
http://localhost:8080
https://localhost:8443



openssl req -x509 -newkey rsa:2048 -keyout clave.key -out certificado.crt -days 365 \
-subj "/C=MX/ST=Ciudad de Mexico/L=Ciudad de Mexico/O=MiEmpresa SA de CV/OU=IT/CN=midominio.com"