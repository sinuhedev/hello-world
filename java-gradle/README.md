# java

# install

```bash
gradle clean
gradle build
gradle build -x test
gradle run
```

# release

```bash
java -jar build/libs/java-gradle--1.0-SNAPSHOT.jar
```

# test

```bash
gradle test
gradle test --tests "app.MainTest"
gradle test --tests "app.Java8Test.lambda8"
```

# jacoco sonar

```bash
gradle sonar
```

# docker

```bash
# build
gradle build
docker build -t "hello-world/java:latest" .
docker buildx build -t "hello-world/java:latest" --platform=linux/amd64 .
# run
docker run -it hello-world/java:latest
```
