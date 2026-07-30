# python

# run
uv python install 3.14.5
uv sync
uv run python src/main.py

# add
uv add request 

# py
uv python list 
uv run python --version

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