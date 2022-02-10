#!/usr/bin/env bash

set -Eeu

export AWS_DEFAULT_OUTPUT="text"

INSTANCE_ID=$(
    aws ec2 describe-spot-instance-requests \
        --filters 'Name=tag:Name,Values=server-instance' \
        --query '"SpotInstanceRequests"[0].InstanceId'
)

echo "Creating an image for instance $INSTANCE_ID..."

IMAGE_ID=$(aws ec2 create-image --name server-ami --instance-id $INSTANCE_ID)

aws ec2 wait image-available --image-ids $IMAGE_ID

echo "Image created successfully."
