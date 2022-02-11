#!/usr/bin/env bash

INSTANCE_NAME="server-instance"
IMAGE_NAME="server-ami"

set -Eeu

export AWS_DEFAULT_OUTPUT="text"

INSTANCE_ID=$(
    aws ec2 describe-spot-instance-requests \
        --filters "Name=tag:Name,Values=${INSTANCE_NAME}" \
        --query '"SpotInstanceRequests"[0].InstanceId'
)

if [ $INSTANCE_ID == "None" ]; then
    echo "Instance not found, skipping."
    exit 0
fi

echo "Creating an image for instance $INSTANCE_ID..."
IMAGE_ID=$(aws ec2 create-image --name $IMAGE_NAME --instance-id $INSTANCE_ID)
aws ec2 wait image-available --image-ids $IMAGE_ID &>/dev/null

echo "Image created successfully."
