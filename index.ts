import "./lib/vpc";
import "./lib/server";
import { eip, hostedZone } from "./lib/dns";

export const nameServers = hostedZone.nameServers.apply((ns) => ns.join(", "));
export const host = eip.address;
