import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "@/types/payload.type";
import type { WebhookRouter } from "@/types/router.type";
import { verifyGithubWebhook } from "@/utils/crypto";
import { webhookOutputLogger } from "@/utils/log";

// Middleware for logging webhook information.
export const logWebhook: WebhookRouter = () => (req, _res, next) => {
	const header = req.headers as unknown as IGithubWebhookRequestHeader;
	const payload = req.body as IGithubWebhookPayload;

	webhookOutputLogger.info(`Webhook received: Event: ${header["x-github-event"]}`);
	webhookOutputLogger.info(`Webhook received: Delivery ID: ${header["x-github-delivery"]}`);
	webhookOutputLogger.info(`Webhook received: Webhook ID: ${header["x-github-hook-id"]}`);
	webhookOutputLogger.info(`Webhook received: On reference: ${payload.ref}`);
	webhookOutputLogger.info(`Webhook received: By: ${payload.pusher.name}`);

	next();
};

// Middleware for processing request body of webhook.
export const processContentType: WebhookRouter = () => (req, res, next) => {
	const header = req.headers as unknown as IGithubWebhookRequestHeader;
	try {
		if (header["content-type"].toLocaleLowerCase() === "application/x-www-form-urlencoded") {
			req.body = JSON.parse(req.body.payload); // transform urlencoded data to JSON.
			next();
			return;
		}
		if (header["content-type"].toLocaleLowerCase() === "application/json") {
			next();
			return;
		}
	} catch (error) {
		res.status(400).json({ error: "Failed to parse x-www-form-urlencoded payload." });
		webhookOutputLogger.error("Received webhook, but failed to parse its content-type");
		webhookOutputLogger.error("So this push event will be ignored.");
		return;
	}
	webhookOutputLogger.error(
		`Unsupported content-type ${header["content-type"]}. Please use application/json or application/x-www-form-urlencoded`,
	);
	res.status(400).json({
		error: `Unsupported content-type ${header["content-type"]}. Please use application/json or application/x-www-form-urlencoded`,
	});
};

// Middleware for validating event type of webhook.
export const validateEvent: WebhookRouter = () => (req, res, next) => {
	const header = req.headers as unknown as IGithubWebhookRequestHeader;
	if (header["x-github-event"] !== "push") {
		webhookOutputLogger.error(`Event ${header["x-github-event"]} is not supported. Only push event is supported.`);
		webhookOutputLogger.error("So this push event will be ignored.");

		res.status(503).json({ error: "Invalid Github Event" });
		return;
	}
	next();
};

// Middleware for validating branch, is current branch consist with remote branch.
// And only changes for master-branch will be passed.

// Middleware for validating signature from github webhook.
export const validateSignature: WebhookRouter = (secret) => (req, res, next) => {
	const header = req.headers as unknown as IGithubWebhookRequestHeader;
	const signature = header["x-hub-signature-256"]?.toString() || "";
	const payload = req.body;
	if (secret == null) {
		next(); // Skip signature verification if secret is not set.
		return;
	}
	if (!verifyGithubWebhook(payload, secret, signature)) {
		webhookOutputLogger.error("Received invalid signature from GitHub webhook.");
		webhookOutputLogger.error("Signature:", signature);
		webhookOutputLogger.error("Suspect this request is not from GitHub official webhook.");
		webhookOutputLogger.error("Or you should make sure the secret is correct.");
		webhookOutputLogger.error("So this push event will be ignored.");
		res.status(401).json({ error: "Unauthorized: Invalid signature" });
		return;
	}
	next();
};

export const logPassedWebhook: WebhookRouter = (secret) => (req, res, next) => {
	const header = req.headers as unknown as IGithubWebhookRequestHeader;
	const payload = req.body as IGithubWebhookPayload;
	webhookOutputLogger.info(`Received a webhook ${header["x-github-hook-id"]} passed validation.`);
	next();
};
