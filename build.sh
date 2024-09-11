#!/bin/bash

set -e

export repo_url=souqodv-snowflake-integration.registry.snowflakecomputing.com/rideshare_demo/public/rideshare_demo_repository
export tag=spcs

# Function to build and push an image
build_and_push() {
    local image_name=$1
    local dockerfile=$2
    local context=$3

    echo "Building and pushing ${image_name}..."
    docker build --rm --platform linux/amd64 -t ${repo_url}/${image_name}:${tag} -f ${dockerfile} ${context} --push
    echo "Pushed ${repo_url}/${image_name}:${tag}"
}

# Build and push server image
build_and_push "ridesharing_server" "server/Dockerfile" "server"

# Build and push web image
build_and_push "ridesharing_web" "web/Dockerfile" "web"

# Build and push proxy image
build_and_push "ridesharing_proxy" "Dockerfile" "."

echo "All images built and pushed successfully."