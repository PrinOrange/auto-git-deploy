import { bold, cyan } from "colors";
import express from "express";
import { ExecuteActions } from "./action";
import { ACTIONS, LOCALHOST_ADDRESS, PORT } from "./consts";
import { GitStatus } from "./git";
import { isPortInUse } from "./libs/port";
import { serverOutputLogger } from "./log";
import { assignWebhookRouters } from "./server";

const main = async () => {
	const server = express();

	// Check if git status is null.
	if (GitStatus == null) {
		serverOutputLogger.error("Can not detect current git status.");
		process.exit(1);
	}

	// Check if the port is in use.
	await isPortInUse(PORT).then((inUse) => {
		if (inUse) {
			console.error(`Port ${bold(`${PORT}`)} is already in use. Please try another port.`);
			process.exit(1);
		}
	});

	// Assign webhook routers to the server.
	assignWebhookRouters(server, (payload) => {
		ExecuteActions(payload, ACTIONS);
	});

	// Start the server.
	server.listen(PORT, () => {
		serverOutputLogger.info(`Server started at ${LOCALHOST_ADDRESS}`);
		console.log(`Server started at ${cyan(bold(LOCALHOST_ADDRESS))} `);
		console.log(`Remote URL: ${GitStatus!.remoteUrl}`);
		console.log(`Current branch: ${GitStatus!.currentBranch}`);
		console.log("Next, use reverse proxy (such as nginx) to map your domain name to this address.");
	});
};

main();
