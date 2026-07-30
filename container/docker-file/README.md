# docker-file

```sh

# build
docker build -t hello-world/docker-file:latest .

# bash : run src/script.sh
docker run  -v $(pwd):/src hello-world/docker-file:latest src/script.sh

```
