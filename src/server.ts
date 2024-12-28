import bodyParser from "body-parser";
import express from "express";
import { verifyGithubWebhook } from "./crypto";
import { GithubWebhookPayload } from "./types/payload.type";

const app = express();
app.use(bodyParser.json());

export const setWebhookServer = (
	port: number,
	payloadURL: string,
	secret: string,
) => {
	app.post(payloadURL, (req, res, next) => {
		const signature = req.headers["x-hub-signature-256"]?.toString() ?? "";
		const payload: GithubWebhookPayload = req.body;

		if (signature === "" || !verifyGithubWebhook(secret, payload, signature)) {
			res.status(401).send("Unauthorized");
			return;
		}

		payload.pusher;
	});

	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
};
