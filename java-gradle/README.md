# java-gradle

# install
```bash
gradle clean
gradle build
gradle build -x test
gradle run
```

# release
```bash
java -jar build/libs/java-gradle-1.0-SNAPSHOT.jar
```

# test
```bash
gradle test
gradle test --rerun-tasks
gradle test --tests "app.MainTest"
gradle test --tests "app.MainTest.test"
```

# jacoco sonar
```bash
gradle sonar
```

# docker
```bash
# build
docker build -t "hello-world/java-gradle:latest" .

# run
docker run --env-file .env -p 3000:3000 -it hello-world/java-gradle:latest
```
