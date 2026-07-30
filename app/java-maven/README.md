# java-maven

# install
```sh
mvn clean
mvn install
mvn -DskipTests clean install
```

# test
```sh
mvn test
mvn test -Dtest=app.MainTest
mvn test -Dtest="app.MainTest#test"
```

# exec
```sh
mvn -DskipTests clean compile
mvn exec:java
```

# release
```sh
mvn -DskipTests clean package
java -jar target/Main-1.0-SNAPSHOT.jar
```

# docker size
```sh
docker image ls hello-world/java-maven:latest
```

# docker shell
```sh
docker run -it --entrypoint sh "hello-world/java-maven:latest"
```

# docker
```sh
docker build -t "hello-world/java-maven:latest" .
docker run --env-file .env -p 3000:3000 -it hello-world/java-maven:latest
```
