import type { Express, Handler } from "express";
import express from "express";
import { SECRET } from "./consts";
import { verifyGithubWebhook } from "./crypto";
import { GitStatus } from "./git";
import { serverOutputLogger } from "./log";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "./types/payload.type";

/**
 * Assign webhook routers to the server.
 * @param server Express server instance.
 * @param callback Function to call when a webhook is received and passed verification.
 */
export const assignWebhookRouters = (server: Express, callback: (payload: IGithubWebhookPayload) => void) => {
	server.use(express.json());
	server.use(express.urlencoded({ extended: true }));

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

	// Middleware for processing request body of webhook.
	const processContentType: Handler = (req, res, next) => {
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
			serverOutputLogger.error("Received webhook, but failed to parse its content-type");
			serverOutputLogger.error("So this push event will be ignored.");
			return;
		}
		serverOutputLogger.error(
			`Unsupported content-type ${header["content-type"]}. Please use application/json or application/x-www-form-urlencoded`,
		);
		res.status(400).json({
			error: `Unsupported content-type ${header["content-type"]}. Please use application/json or application/x-www-form-urlencoded`,
		});
	};

	// Middleware for validating event type of webhook.
	const validateEvent: Handler = (req, res, next) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		if (header["x-github-event"] !== "push") {
			serverOutputLogger.error(`Event ${header["x-github-event"]} is not supported. Only push event is supported.`);
			serverOutputLogger.error("So this push event will be ignored.");

			res.status(503).json({ error: "Invalid Github Event" });
			return;
		}
		next();
	};

	// Middleware for validating branch, is current branch consist with remote branch.
	// And only changes for master-branch will be passed.
	const validateGitStatus: Handler = (req, res, next) => {
		const payload = req.body as IGithubWebhookPayload;

		const masterBranch = payload.repository.master_branch;

		if (GitStatus == null || GitStatus.currentBranch == null) {
			serverOutputLogger.error("Can not detect current git status.");
			serverOutputLogger.error("Maybe you should init or reset the git.");
			res.status(500).json({ error: "Internal Server Error" });
			return;
		}

		// Check whether current git branch is master branch.
		if (GitStatus.currentBranch !== masterBranch) {
			serverOutputLogger.error(`Current branch ${GitStatus.currentBranch} is not the default branch.`);
			serverOutputLogger.error(`Your should checkout the branch ${masterBranch} manually.`);
			serverOutputLogger.error("So this push event will be ignored.");

			res.status(500).json({ error: `Current branch ${GitStatus.currentBranch} is not the default branch.` });
			return;
		}
		// Check whether the changes received is for master branch.
		if (payload.ref !== `refs/heads/${masterBranch}` || payload.ref !== masterBranch) {
			serverOutputLogger.error(`Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}`);
			serverOutputLogger.error("So this push event will be ignored.");

			res.status(500).json({ error: `Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}` });
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
	server.post("/", logWebhook, processContentType, validateEvent, validateGitStatus, validateSignature, applyPayload);

	// Router to check if the server is running.
	server.get("/", (_req, res) => {
		res.send("The server is running successfully.");
	});
};
