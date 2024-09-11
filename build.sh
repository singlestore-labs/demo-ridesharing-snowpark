#!/bin/bash

# export repo_url=souqodv-snowflake-integration.registry.snowflakecomputing.com/rideshare_demo/public/rideshare_demo_repository
# export tag=spcs
# export image_name=ridesharing_server
# docker image rm ${image_name}:${tag}
# docker build --rm --platform linux/amd64 -t ${image_name}:${tag} --progress=plain -f server/Dockerfile server
# docker image rm ${repo_url}/${image_name}:${tag}
# docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
# docker push ${repo_url}/${image_name}:${tag}
# echo ${repo_url}/${image_name}:${tag}

# export tag=spcs
# export image_name=ridesharing_web
# docker image rm ${image_name}:${tag}
# docker build --rm --platform linux/amd64 -t ${image_name}:${tag} --progress=plain -f web/Dockerfile web
# docker image rm ${repo_url}/${image_name}:${tag}
# docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
# docker push ${repo_url}/${image_name}:${tag}
# echo ${repo_url}/${image_name}:${tag}

# export tag=spcs
# export image_name=ridesharing_proxy
# docker image rm ${image_name}:${tag}
# docker build --rm --platform linux/amd64 -t ${image_name}:${tag} --progress=plain .
# docker image rm ${repo_url}/${image_name}:${tag}
# docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
# docker push ${repo_url}/${image_name}:${tag}
# echo ${repo_url}/${image_name}:${tag}

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