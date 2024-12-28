import express from "express";
import join from "url-join";
import { loadConfigFromFile } from "./config";
import { assignWebhookRouters } from "./server";
import { ExecuteActions } from "./action";

const { port, secret, payloadURL, actions } = loadConfigFromFile(
	"git-auto-deploy.json",
);
const localhostAddress = join(`http://localhost:${port}`, payloadURL);

const main = async () => {
	const server = express();

	assignWebhookRouters(server, payloadURL, secret, (payload) => {
		ExecuteActions(payload, actions);
	});

	server.listen(port, () => {
		console.log(`Server started at ${localhostAddress}`);
	});
};

main();
