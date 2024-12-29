import bodyParser from "body-parser";
import type { Express, Handler } from "express";
import { verifyGithubWebhook } from "./crypto";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "./types/payload.type";
import { serverOutputLogger } from "./log";
import { GitStatus } from "./git";
import { SECRET } from "./consts";

/**
 * Assign webhook routers to the server.
 * @param server Express server instance.
 * @param callback Function to call when a webhook is received and passed verification.
 */
export const assignWebhookRouters = (server: Express, callback: (payload: IGithubWebhookPayload) => void) => {
	server.use(bodyParser.json());

	// Middleware for logging webhook information.
	const logWebhook: Handler = (req, _res, next) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		const payload = req.body as IGithubWebhookPayload;

		serverOutputLogger.info(`Webhook received: Event: ${header["x-github-event"]}`);
		serverOutputLogger.info(`Webhook received: Delivery ID: ${header["x-github-delivery"]}`);
		serverOutputLogger.info(`Webhook received: Webhook ID: ${header["x-github-hook-id"]}`);
		serverOutputLogger.info(`Webhook received: Received update: ${payload.commits}`);
		serverOutputLogger.info(`Webhook received: On reference: ${payload.ref}`);
		serverOutputLogger.info(`Webhook received: By: ${payload.pusher.name}`);

		next();
	};

	// Middleware for validating content type of webhook.
	const validateContentType: Handler = (req, res, next) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		if (header["content-type"] !== "application/json") {
			serverOutputLogger.error(`Content-Type of webhook: ${header["content-type"]} is not supported.`);
			serverOutputLogger.error("So this push event will be ignored.");

			res.status(503).json({
				error: "Unsupported Content-Type, please use application/json.",
			});
			return;
		}
		next();
	};

	// Middleware for validating event type of webhook.
	const validateEvent: Handler = (req, res, next) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		if (header["x-github-event"] !== "push") {
			serverOutputLogger.error(`Event ${header["x-github-event"]} is not supported. Only push event is supported.`);
			serverOutputLogger.error("So this push event will be ignored.");

			res.status(503).json({ error: "Internal Github Event" });
			return;
		}
		next();
	};

	// Middleware for validating branch, is current branch consist with remote branch.
	const validateBranch: Handler = (req, res, next) => {
		const payload = req.body as IGithubWebhookPayload;
		if (GitStatus === null) {
			serverOutputLogger.error("Can not detect current git status.");
			res.status(500).json({ error: "Internal Server Error" });
			return;
		}
		if (GitStatus.currentBranch !== payload.repository.default_branch) {
			serverOutputLogger.error(`Current branch ${GitStatus.currentBranch} is not the default branch.`);
			serverOutputLogger.error(`Your should checkout the branch ${payload.repository.default_branch}.`);
			serverOutputLogger.error("So this push event will be ignored.");

			res.status(500).json({ error: "Internal Server Error" });
			return;
		}
		next();
	};

	// Middleware for validating signature from github webhook.
	const validateSignature: Handler = (req, res, next) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		const signature = header["x-hub-signature-256"]?.toString() || "";
		const payload = req.body;
		if (SECRET == null) {
			next(); // Skip signature verification if secret is not set.
			return;
		}
		if (!verifyGithubWebhook(payload, signature)) {
			serverOutputLogger.error("Received invalid signature from GitHub webhook.");
			serverOutputLogger.error("Signature:", signature);
			serverOutputLogger.error("Suspect this request is not from GitHub official webhook.");
			serverOutputLogger.error("Or you should make sure the secret is correct.");
			serverOutputLogger.error("So this push event will be ignored.");
			res.status(401).json({ error: "Unauthorized: Invalid signature" });
			return;
		}
		next();
	};

	// Middleware for apply payload to callback function.
	const applyPayload: Handler = (req, res) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		const payload = req.body as IGithubWebhookPayload;
		callback(payload);
		res.status(200).send("Success");
	};

	// Assign routers to server.
	server.post("/", logWebhook, validateContentType, validateEvent, validateBranch, validateSignature, applyPayload);

	// Router to check if the server is running.
	server.get("/", (_req, res) => {
		res.send("The server is running successfully.");
	});
};
