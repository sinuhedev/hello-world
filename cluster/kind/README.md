# kind

```sh

# cluster
kind create cluster
kind create cluster --name kind-2

kind get clusters

kubectl cluster-info --context kind-kind
kubectl cluster-info --context kind-kind-2

kind delete cluster

# start and stop ... --filter "name=my-cluster")
docker stop $(docker ps -q --filter "kind")
docker start $(docker ps -a -q --filter "kind")
docker restart $(docker ps -q --filter "name=kind")



```
