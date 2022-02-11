#!/usr/bin/env bash

INSTANCE_NAME="server-instance"
IMAGE_NAME="server-ami"

set -Eeu

export AWS_DEFAULT_OUTPUT="text"

QUERY=(
    $(
        aws ec2 describe-images \
            --owners self \
            --filters "Name=tag:Name,Values=${IMAGE_NAME}" \
            --query 'Images[0].[ImageId,BlockDeviceMappings[0].Ebs.SnapshotId]'
    )
)

IMAGE_ID=${QUERY[0]}
SNAPSHOT_ID=${QUERY[1]}

INSTANCE_ID=$(
    aws ec2 describe-spot-instance-requests \
        --filters "Name=tag:Name,Values=${INSTANCE_NAME}" \
        --filters "Name=launch.image-id,Values=${IMAGE_ID}" \
        --query '"SpotInstanceRequests"[0].InstanceId'
)

if [ $INSTANCE_ID == "None" ]; then
    echo "No running instance found, aborting deletion."
    exit 0
fi

echo "Deleting image $IMAGE_ID..."
aws ec2 deregister-image --image-id $IMAGE_ID

echo "Deleting snapshot $SNAPSHOT_ID..."
aws ec2 delete-snapshot --snapshot-id $SNAPSHOT_ID

echo "Image deleted successfully."
