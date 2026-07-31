import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

/**
 * Org infra template — Cloudflare DNS starter for email deliverability.
 *
 * pulumi config set cloudflareZoneId <zone-id>
 * pulumi config set cloudflare:apiToken --secret <token>
 * pulumi config set domain example.com
 */

const config = new pulumi.Config();
const zoneId = config.require("cloudflareZoneId");
const domain = config.require("domain");
const dmarcPolicy = config.get("dmarcPolicy") ?? "none";
const dmarcRua = config.get("dmarcRua") ?? "";

new cloudflare.DnsRecord("dmarc", {
	zoneId,
	name: "_dmarc",
	type: "TXT",
	content: dmarcRua
		? `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcRua};`
		: `v=DMARC1; p=${dmarcPolicy};`,
	ttl: 1,
	comment: "DMARC — start at p=none; escalate after alignment",
});

export const resendSendingHost = `updates.${domain}`;
export const resendReturnPathHost = `send.${domain}`;
export const resendTrackingHost = `links.${domain}`;
export const transactionalFromHint = `support@updates.${domain}`;
export const humanSmtpHint =
	"ZeptoMail for human Gmail send-as; Resend for application code only";
