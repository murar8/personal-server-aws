import * as awsx from "@pulumi/awsx";

export const vpc = new awsx.ec2.Vpc("server-vpc", {
    subnets: [{ type: "public" }],
    requestedAvailabilityZones: 1,
});

export const securityGroup = new awsx.ec2.SecurityGroup("server-security-group", { vpc });

awsx.ec2.SecurityGroupRule.ingress("ping", securityGroup, new awsx.ec2.AnyIPv4Location(), new awsx.ec2.IcmpPorts(0, 8));
awsx.ec2.SecurityGroupRule.ingress("ssh", securityGroup, new awsx.ec2.AnyIPv4Location(), new awsx.ec2.TcpPorts(22));
awsx.ec2.SecurityGroupRule.ingress("http", securityGroup, new awsx.ec2.AnyIPv4Location(), new awsx.ec2.TcpPorts(80));
awsx.ec2.SecurityGroupRule.ingress("https", securityGroup, new awsx.ec2.AnyIPv4Location(), new awsx.ec2.TcpPorts(443));

awsx.ec2.SecurityGroupRule.egress("ipv4", securityGroup, new awsx.ec2.AnyIPv4Location(), new awsx.ec2.AllTraffic());
awsx.ec2.SecurityGroupRule.egress("ipv6", securityGroup, new awsx.ec2.AnyIPv6Location(), new awsx.ec2.AllTraffic());
