#!/usr/bin/env bash

set -Eeu

export AWS_DEFAULT_OUTPUT="text"

QUERY=(
    $(
        aws ec2 describe-images \
            --owners self \
            --filters 'Name=name,Values=server-ami' \
            --query 'Images[0].[ImageId,BlockDeviceMappings[0].Ebs.SnapshotId]'
    )
)

IMAGE_ID=${QUERY[0]}

echo "Deleting image $IMAGE_ID..."
aws ec2 deregister-image --image-id $IMAGE_ID

SNAPSHOT_ID=${QUERY[1]}

echo "Deleting snapshot $SNAPSHOT_ID..."
aws ec2 delete-snapshot --snapshot-id $SNAPSHOT_ID

echo "Image deleted successfully."
