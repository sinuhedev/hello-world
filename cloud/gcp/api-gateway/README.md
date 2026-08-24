# Network endpoint group

```sh
gcloud beta compute network-endpoint-groups create api-gateway-serverless-neg \
  --region=us-central1 \
  --network-endpoint-type=serverless \
  --serverless-deployment-platform=apigateway.googleapis.com \
  --serverless-deployment-resource=api

gcloud compute backend-services create api-gateway-backend-service --global  

gcloud compute backend-services add-backend api-gateway-backend-service \
  --global \
  --network-endpoint-group=api-gateway-serverless-neg \
  --network-endpoint-group-region=us-central1
```