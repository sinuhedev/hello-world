

```bash
gcloud builds submit --tag gcr.io/sinuhe-development/cloud-run-docker
gcloud run deploy dev-api --image gcr.io/sinuhe-development/cloud-run-docker --allow-unauthenticated --region us-central1 
gcloud container images delete gcr.io/sinuhe-development/cloud-run-docker
```




```bash
# pack build --builder gcr.io/buildpacks/builder:v1 cloud-run-docker
docker buildx build -t cloud-run-docker:latest --load .
docker run -p 8080:8080 cloud-run-docker
docker run -it cloud-run-docker  sh
```


