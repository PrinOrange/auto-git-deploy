import os from "node:os";
import type { Express, Handler } from "express";
import express from "express";
import { SECRET } from "./config";
import { verifyGithubWebhook } from "./crypto";
import { GitStatus } from "./git";
import { webhookOutputLogger } from "./log";
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

		webhookOutputLogger.info(`Webhook received: Event: ${header["x-github-event"]}`);
		webhookOutputLogger.info(`Webhook received: Delivery ID: ${header["x-github-delivery"]}`);
		webhookOutputLogger.info(`Webhook received: Webhook ID: ${header["x-github-hook-id"]}`);
		webhookOutputLogger.info(`Webhook received: Received update: ${payload.commits}`);
		webhookOutputLogger.info(`Webhook received: On reference: ${payload.ref}`);
		webhookOutputLogger.info(`Webhook received: By: ${payload.pusher.name}`);

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
	const validateEvent: Handler = (req, res, next) => {
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
	const validateGitStatus: Handler = (req, res, next) => {
		const payload = req.body as IGithubWebhookPayload;

		const masterBranch = payload.repository.master_branch;

		if (GitStatus == null || GitStatus.currentBranch == null) {
			webhookOutputLogger.error("Can not detect current git status.");
			webhookOutputLogger.error("Maybe you should init or reset the git.");
			res.status(500).json({ error: "Internal Server Error" });
			return;
		}

		// Check whether current git branch is master branch.
		if (GitStatus.currentBranch !== masterBranch) {
			webhookOutputLogger.error(`Current branch ${GitStatus.currentBranch} is not the default branch.`);
			webhookOutputLogger.error(`Your should checkout the branch ${masterBranch} manually.`);
			webhookOutputLogger.error("So this push event will be ignored.");

			res.status(500).json({
				error: `Current branch ${GitStatus.currentBranch} is not the default branch.`,
			});
			return;
		}
		// Check whether the changes received is for master branch.
		if (payload.ref !== `refs/heads/${masterBranch}` && payload.ref !== masterBranch) {
			webhookOutputLogger.error(`Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}`);
			webhookOutputLogger.error("So this push event will be ignored.");

			res.status(500).json({
				error: `Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}`,
			});
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
