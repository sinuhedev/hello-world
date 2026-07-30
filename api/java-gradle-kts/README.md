# java-gradle-kts

# install
```bash
gradle clean
gradle build
gradle build -x test
gradle run
```

# test
```bash
gradle test
gradle test --rerun-tasks
gradle test --tests "app.MainTest"
gradle test --tests "app.MainTest.test"
```

# release
```bash
java -jar build/libs/java-gradle-kts-1.0-SNAPSHOT.jar
```

# jacoco sonar
```bash
gradle sonar
```

# docker size
```sh
docker image ls hello-world/java-gradle-kts:latest
```

# docker shell
```sh
docker run -it --entrypoint sh "hello-world/java-gradle-kts:latest"
```

# docker
```sh
docker build -t "hello-world/java-gradle-kts:latest" .
docker run --env-file .env -p 3000:3000 -it hello-world/java-gradle-kts:latest
```
