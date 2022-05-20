DOCKER_IMAGE="tanibe-next-app-lambda"
TAG=":latest"
ECR="110840261805.dkr.ecr.ap-northeast-1.amazonaws.com"



docker build -t "$DOCKER_IMAGE""$TAG" ./
docker run -d -p 3000:3000 --name "$DOCKER_IMAGE" "$DOCKER_IMAGE""$TAG"
docker tag "$DOCKER_IMAGE""$TAG" "$ECR"/"$DOCKER_IMAGE""$TAG"
aws ecr get-login-password --region ap-northeast-1 --profile marvel | docker login --username AWS --password-stdin https://"$ECR"
docker push "$ECR"/"$DOCKER_IMAGE""$TAG"
