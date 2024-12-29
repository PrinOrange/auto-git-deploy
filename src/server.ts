import bodyParser from "body-parser";
import { Express, Handler } from "express";
import { verifyGithubWebhook } from "./crypto";
import { GithubWebhookPayload, GithubWebhookRequestHeader } from "./types/payload.type";
import { serverOutputLogger } from "./log";
import { GitStatus } from "./git";
import { SECRET } from "./consts";

/**
 * Assign webhook routers to the server.
 * @param server Express server instance.
 * @param callback Function to call when a webhook is received and passed verification.
 */
export const assignWebhookRouters = (server: Express, callback: (payload: GithubWebhookPayload) => void) => {
	server.use(bodyParser.json());

	// Middleware for logging webhook information.
	const logWebhook: Handler = (req, _res, next) => {
		const payload = req.body as GithubWebhookPayload;

		serverOutputLogger.info(`Webhook received: Received Push update: ${payload.commits}`);
		serverOutputLogger.info(`Webhook received: On reference: ${payload.ref}`);
		serverOutputLogger.info(`Webhook received: By: ${payload.pusher.name}`);

		next();
	};

	// Middleware for validating branch, is current branch consist with remote branch.
	const validateBranch: Handler = (req, res, next) => {
		const payload = req.body as GithubWebhookPayload;
		if (GitStatus === null) {
			serverOutputLogger.error("Can not detect current git status.");
			res.status(500).json({ error: "Internal Server Error" });
			return;
		}
		if (GitStatus.currentBranch !== payload.repository.default_branch) {
			serverOutputLogger.error(`Current branch ${GitStatus.currentBranch} is not the default branch.`);
			serverOutputLogger.error(`Your should checkout the branch ${payload.repository.default_branch}.`);
			serverOutputLogger.error(`So this push event will be ignored.`);

			res.status(500).json({ error: "Internal Server Error" });
			return;
		}
		next();
	};

	// Middleware for validating signature from github webhook.
	const validateSignature: Handler = (req, res, next) => {
		const header = req.headers as unknown as GithubWebhookRequestHeader;
		const signature = header["x-hub-signature-256"]?.toString() || "";
		const payload = req.body;
		if (!SECRET) {
			next();
			return;
		}
		if (!verifyGithubWebhook(SECRET!, payload, signature)) {
			console.error("Invalid webhook signature detected.");
			res.status(401).json({ error: "Unauthorized: Invalid signature" });
			return;
		}
		next();
	};

	// Middleware for apply payload to callback function.
	const applyPayload: Handler = (req, res) => {
		const header = req.headers as unknown as GithubWebhookRequestHeader;
		const payload = req.body as GithubWebhookPayload;
		console.log(`Webhook received action "${header["x-github-event"]}" from ${payload.repository.full_name}`);
		callback(payload);
		res.status(200).send("Success");
	};

	// Assign routers to server.
	server.post("/", logWebhook, validateBranch, validateSignature, applyPayload);
};
