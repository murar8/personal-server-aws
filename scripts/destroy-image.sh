#!/usr/bin/env bash

INSTANCE_NAME="server-instance"
IMAGE_NAME="server-ami"

set -Eeu

export AWS_DEFAULT_OUTPUT="text"

QUERY=(
    $(
        aws ec2 describe-images \
            --owners self \
            --filters "Name=name,Values=${IMAGE_NAME}" \
            --query 'Images[0].[ImageId,BlockDeviceMappings[0].Ebs.SnapshotId]'
    )
)

if [ $QUERY == "None" ]; then
    echo "No image found, aborting."
    exit 0
fi

IMAGE_ID=${QUERY[0]}
SNAPSHOT_ID=${QUERY[1]}

REQUEST_ID=$(
    aws ec2 describe-spot-instance-requests \
        --filters "Name=tag:Name,Values=${INSTANCE_NAME}" \
        --filters "Name=launch.image-id,Values=${IMAGE_ID}" \
        --filters "Name=state,Values=active" \
        --query '"SpotInstanceRequests"[0].InstanceId'
)

if [ $REQUEST_ID == "None" ]; then
    echo "No active spot request found, aborting deletion."
    exit 0
fi

echo "Deleting image $IMAGE_ID..."
aws ec2 deregister-image --image-id "$IMAGE_ID" &>/dev/null

echo "Deleting snapshot $SNAPSHOT_ID..."
aws ec2 delete-snapshot --snapshot-id "$SNAPSHOT_ID" &>/dev/null

echo "Image deleted successfully."
