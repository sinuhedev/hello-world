# mongo

## Commands

```bash
docker-compose [ config | logs | start | stop | up ]

docker exec -it mongodb-mongodb-1 bash
```

# TLS
```bash
openssl req -new -x509 -days 9999 -nodes -out etc-tls/localhost.crt -keyout etc-tls/localhost.key -subj "/CN=localhost"
cat etc-tls/localhost.key etc-tls/localhost.crt > etc-tls/localhost.pem
```

## Mongo shell
```js

// version
db.version();

// get config
db.adminCommand( {getCmdLineOpts: 1});

```

## String format
```bash
mongodb://root:root@localhost:27017/?authSource=admin
mongodb://root:root@localhost:27017/?authSource=admin&ssl=true
```