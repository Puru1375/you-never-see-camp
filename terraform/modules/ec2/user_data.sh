#!/bin/bash

set -e

echo "Starting EC2 setup..."

apt-get update -y

apt-get install -y \
    docker.io \
    git \
    curl \
    unzip \
    python3

systemctl enable docker
systemctl start docker

echo "Installing AWS CLI..."

if ! command -v aws >/dev/null 2>&1; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" \
        -o "/tmp/awscliv2.zip"

    unzip -q /tmp/awscliv2.zip -d /tmp

    /tmp/aws/install
fi

echo "Preparing application..."

mkdir -p /opt/you-never-see-camp

cd /opt/you-never-see-camp

if [ ! -d "app" ]; then
    git clone ${repository_url} app
fi

cd app/server

echo "Building Docker image..."

docker build \
    -t you-never-see-camp-backend:latest \
    .

echo "Getting application secrets..."

SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "${app_secret_arn}" \
    --query SecretString \
    --output text \
    --region "${aws_region}")

echo "$SECRET_JSON" | python3 -c '
import json
import sys

data = json.load(sys.stdin)

with open("/tmp/app.env", "w") as f:
    for key, value in data.items():
        f.write(f"{key}={value}\n")
'

chmod 600 /tmp/app.env

echo "Starting Docker container..."

docker rm -f you-never-see-camp-backend 2>/dev/null || true

docker run -d \
    --name you-never-see-camp-backend \
    --restart unless-stopped \
    --env-file /tmp/app.env \
    -p ${app_port}:${app_port} \
    you-never-see-camp-backend:latest

rm -f /tmp/app.env

echo "Application deployment completed successfully."