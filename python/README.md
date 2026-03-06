# python

# python 
uv python list 
uv run python --version

# add
uv add request 

# run
uv sync
uv run python src/main.py

# docker
```sh
# size
docker image ls hello-world/python:latest

# shell
docker run -it --entrypoint sh "hello-world/python:latest"

# build
docker buildx build -t "hello-world/python:latest" .

# run
docker run --env-file .env -p 3000:3000 -it hello-world/python:latest
```