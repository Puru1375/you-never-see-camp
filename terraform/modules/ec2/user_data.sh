#!/bin/bash

set -e

echo "Starting EC2 setup..."

apt-get update -y

apt-get install -y \
    docker.io \
    git \
    curl

systemctl enable docker
systemctl start docker

mkdir -p /opt/you-never-see-camp

cd /opt/you-never-see-camp

if [ ! -d "app" ]; then
    git clone ${repository_url} app
fi

cd app/server

docker build \
    -t you-never-see-camp-backend:latest \
    .

docker rm -f you-never-see-camp-backend 2>/dev/null || true

docker run -d \
    --name you-never-see-camp-backend \
    --restart unless-stopped \
    -p ${app_port}:${app_port} \
    you-never-see-camp-backend:latest

echo "Application deployment completed."