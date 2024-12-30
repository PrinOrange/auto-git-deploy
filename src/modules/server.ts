import type { Express, Handler } from "express";
import express from "express";
import { verifyGithubWebhook } from "@/utils/crypto";
import { appOutputLogger, webhookOutputLogger } from "@/utils/log";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "@/types/payload.type";
import { isPortInUse } from "@/libs/port";
import { bold } from "colors";

/**
 * Check if the port specified in the configuration file is available.
 * @returns True if the port is available, false otherwise.
 */
export const checkPortAvailability = async (port: number): Promise<boolean> => {
	try {
		// Check if the port is in use
		const isAvailable = !(await isPortInUse(port));
		if (isAvailable) {
			return true;
		}
	} catch (error) {
		// Log error if any exception occurs during port checking
		appOutputLogger.error(`An error occurred while checking port availability: ${String(error)}`);
	}
	// Log the error for an unavailable port
	appOutputLogger.error(`Port ${bold(`${port}`)} is already in use. Please try another port.`);
	return false;
};

/**
 * Assign webhook routers to the server.
 * @param server Express server instance.
 * @param callback Function to call when a webhook is received and passed verification.
 */
export const assignWebhookRouters = (
	server: Express,
	secret: string | null,
	callback: (header: IGithubWebhookRequestHeader, payload: IGithubWebhookPayload) => void,
) => {
	server.use(express.json());
	server.use(express.urlencoded({ extended: true }));

	// Middleware for logging webhook information.
	const logWebhook: Handler = (req, _res, next) => {
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

	// Middleware for validating signature from github webhook.
	const validateSignature: Handler = (req, res, next) => {
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

	// Middleware for apply payload to callback function.
	const applyPayload: Handler = (req, res) => {
		const header = req.headers as unknown as IGithubWebhookRequestHeader;
		const payload = req.body as IGithubWebhookPayload;
		appOutputLogger.info(`Received a webhook ${header["x-github-hook-id"]} passed validation.`);
		callback(header, payload);
		res.status(200).send("Success");
	};

	// Assign routers to server.
	server.post("/", logWebhook, processContentType, validateEvent, validateSignature, applyPayload);

	// Router to check if the server is running.
	server.get("/", (_req, res) => {
		res.send("The server is running successfully.");
	});
};
