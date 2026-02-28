# nodejs

# to start
npm i
node --run dev

# docker
```bash
docker buildx build -t "hello-world/nodejs:latest" .
docker run --env-file .env -p 3000:3000 -it hello-world/nodejs:latest
```