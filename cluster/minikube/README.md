#### hello-kubernets

# minikube
```sh
minikube start | stop | status | ip | dashboard
minikube delete --all
```

# kubectl
```bash
kubectl cluster-info

kubectl config get-contexts
kubectl config view

kubectl get ns
kubectl get nodes
kubectl get events
kubectl get pods
kubectl get services
kubectl get deployments

kubectl get all
kubectl get svc

kubectl describe pods
```

## apps
```sh
# image
docker buildx build apps/app-nodejs -t "app-nodejs:v0.0.0" 
# test
docker run -p 4000:4000 app-nodejs:v0.0.0
# load image in minikube
minikube image load app-nodejs:v0.0.0

# Deployment
kubectl create deployment app-nodejs --image=app-nodejs:v0.0.0
# Services
kubectl expose deployment app-nodejs --type=LoadBalancer --port=4000

# yml
kubectl apply -f app-nodejs.yml

# url
minikube service app-nodejs --url

# clean
kubectl delete deployment app-nodejs
kubectl delete service app-nodejs
```

