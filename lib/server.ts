import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { securityGroup, vpc } from "./vpc";
import * as fs from "fs";
import path = require("path");

const config = new pulumi.Config("instance");
const instanceType = config.require("type");
const volumeSize = config.requireNumber("volume-size");
const spotPrice = config.require("max-price");

async function getAmi() {
    try {
        const owner = await aws.getCallerIdentity();
        return await aws.ec2.getAmi({
            mostRecent: true,
            owners: [owner.accountId],
            filters: [{ name: "name", values: ["server-ami"] }],
        });
    } catch {
        return aws.ec2.getAmi({
            mostRecent: true,
            owners: ["amazon"],
            filters: [{ name: "name", values: ["amzn2-ami-hvm-*-x86_64-gp2"] }],
        });
    }
}

const keyPair = new aws.ec2.KeyPair("server-key-pair", {
    publicKey: process.env.PUBLIC_KEY!,
});

const userData = fs.readFileSync(path.join(__dirname, "..", "cloud-init.yaml")).toString();

export const spotRequest = new aws.ec2.SpotInstanceRequest("server-spot-request", {
    instanceType,
    spotPrice,
    userData,
    ami: getAmi().then((ami) => ami.id),
    keyName: keyPair.keyName,
    instanceInterruptionBehavior: "stop",
    vpcSecurityGroupIds: [securityGroup.id],
    subnetId: pulumi.output(vpc.publicSubnetIds).apply((ids) => ids[0]),
    rootBlockDevice: { volumeType: "gp3", volumeSize },
    waitForFulfillment: true,
    tags: { Name: "server-instance" },
});
