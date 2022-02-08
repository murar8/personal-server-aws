import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { securityGroup, vpc } from "./vpc";

const config = new pulumi.Config("instance");
const instanceType = config.require("type");
const volumeSize = config.requireNumber("volume-size");
const spotPrice = config.require("max-price");
const publicKey = config.require("public-key");

const ami = aws.ec2.getAmi({
    mostRecent: true,
    owners: ["amazon"],
    filters: [{ name: "name", values: ["amzn2-ami-hvm-*-x86_64-gp2"] }],
});

const keyPair = new aws.ec2.KeyPair("server-key-pair", { publicKey });

export const spotRequest = new aws.ec2.SpotInstanceRequest("server-spot-request", {
    ami: ami.then((ami) => ami.id),
    instanceType,
    instanceInterruptionBehavior: "stop",
    keyName: keyPair.keyName,
    vpcSecurityGroupIds: [securityGroup.id],
    subnetId: pulumi.output(vpc.publicSubnetIds).apply((ids) => ids[0]),
    rootBlockDevice: { volumeType: "gp3", volumeSize, deleteOnTermination: false },
    waitForFulfillment: true,
    spotPrice,
});
