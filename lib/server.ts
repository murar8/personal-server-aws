import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { securityGroup, vpc } from "./vpc";
import * as fs from "fs";
import path = require("path");

const config = new pulumi.Config("instance");
const instanceType = config.require("type");
const volumeSize = config.requireNumber("volume-size");
const spotPrice = config.require("max-price");
const username = config.require("username");

const networkConfig = new pulumi.Config("network");
const domain = networkConfig.require("domain");
const subdomain = networkConfig.require("subdomain");

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

if (!process.env.PUBLIC_KEY) throw new Error("PUBLIC_KEY not set.");

const userData = fs
    .readFileSync(path.join(__dirname, "..", "cloud-init.yaml"))
    .toString()
    .replace("$PUBLIC_KEY", process.env.PUBLIC_KEY)
    .replace("$USER", username)
    .replace("$FQDN", subdomain + "." + domain);

export const spotRequest = new aws.ec2.SpotInstanceRequest("server-spot-request", {
    instanceType,
    spotPrice,
    userData,
    ami: getAmi().then((ami) => ami.id),
    instanceInterruptionBehavior: "stop",
    vpcSecurityGroupIds: [securityGroup.id],
    subnetId: pulumi.output(vpc.publicSubnetIds).apply((ids) => ids[0]),
    rootBlockDevice: { volumeType: "gp3", volumeSize },
    waitForFulfillment: true,
    tags: { Name: "server-instance" },
});
