import bodyParser from "body-parser";
import { Express, Handler } from "express";
import { verifyGithubWebhook } from "./crypto";
import { GithubWebhookPayload } from "./types/payload.type";

export const assignWebhookRouters = (
	server: Express,
	payloadURL: string,
	secret: string | null = null,
	callback: (payload: GithubWebhookPayload) => void,
) => {
	server.use(bodyParser.json());

	// Router for validate signature from github webhook.
	const validateSignature: Handler = (req, res, next) => {
		const signature = req.headers["x-hub-signature-256"]?.toString() || "";
		const payload = req.body;
		if (!verifyGithubWebhook(secret!, payload, signature)) {
			console.error("Invalid webhook signature detected.");
			res.status(401).json({ error: "Unauthorized: Invalid signature" });
			return;
		}
		next();
	};

	// Apply payload to callback function.
	const applyPayload: Handler = (req, res) => {
		const payload = req.body as GithubWebhookPayload;
		console.log(`Webhook received at ${payloadURL} from ${req.ip}`);
		callback(payload);
		res.status(200).send("Success");
	};

	// Assign routers to server.
	server.post(
		payloadURL,
		secret ? validateSignature : (req, res, next) => next(),
		applyPayload,
	);
};
