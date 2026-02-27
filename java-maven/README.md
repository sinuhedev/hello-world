# java-maven

# install
```bash
mvn clean
mvn install
mvn -DskipTests clean install
```

# test
```bash
mvn test
mvn test -Dtest=app.MainTest
mvn test -Dtest="app.MainTest#utest"
```

# exec
```bash
mvn -DskipTests clean compile
mvn exec:java
```

# release
```bash
mvn -DskipTests clean package
java -jar target/Main-1.0-SNAPSHOT.jar
```

# docker
```bash
docker buildx build -t "hello-world/java:latest" .
docker run  --env-file .env -it hello-world/java:latest
```


