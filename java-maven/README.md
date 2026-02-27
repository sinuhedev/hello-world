# java-maven

# install
```bash
mvn clean
mvn install
mvn clean install -DskipTests
```

# release
```bash
mvn package -DskipTests 
java -jar target/Main-1.0-SNAPSHOT.jar
```

# test
```bash
mvn test
mvn test -Dtest=app.MainTest
mvn test -Dtest="app.MainTest#utest"
```

# docker
```bash
docker buildx build -t "hello-world/java:latest" .
docker run -it hello-world/java:latest
```
