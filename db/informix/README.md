```sh
Host: localhost
Port: 9088
Server: informix
Database: db
User: informix
Password: in4mix
```

# permission
```sh
chmod -R 777 ./informix-init
```

# run files
```sh
./dbaccess src/users.sql
./dbaccess src/load-users.sql
```

load from src/users.csv insert into users;