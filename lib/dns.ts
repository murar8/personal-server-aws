import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { spotRequest } from "./server";

const config = new pulumi.Config("network");
const domain = config.require("domain");
const subdomain = config.require("subdomain");

const fqdn = subdomain + "." + domain;

export const eip = new aws.ec2.Eip("server-eip", { vpc: true, instance: spotRequest.spotInstanceId });

export const hostedZone = new aws.route53.Zone("server-zone", { name: domain });

export const dnsRecord = new aws.route53.Record("server-record", {
    name: fqdn,
    records: [eip.publicIp],
    zoneId: hostedZone.id,
    type: "A",
    ttl: 300,
});
