# java-spring-maven

# install

```bash
mvn clean
mvn install
mvn clean install -DskipTests
```

# release

```bash
java -jar target/java-spring-maven-0.0.1-SNAPSHOT.jar
```

# test

```bash
mvn test
mvn test -Dtest=app.MainTest
mvn test -Dtest="app.Java8Test#lambda8"
```

# docker

```bash
# build
mvn clean install -DskipTests

docker buildx build -t "hello-world/java:latest" .
# run
docker run hello-world/java:latest
```
