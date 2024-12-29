import { bold, cyan, underline } from "colors";
import express from "express";
import { ExecuteShellActions } from "./action";
import { GitStatus } from "./git";
import { isPortInUse } from "./libs/port";
import { appOutputLogger, LOG_FILENAME } from "./log";
import { assignWebhookRouters } from "./server";
import { ACTIONS, PORT } from "./config";

export const LOCALHOST_ADDRESS = `http:\/\/localhost:${PORT}\/`;

const main = async () => {
	console.log(LOG_FILENAME);
	const server = express();

	// Check if git status is null.
	if (GitStatus == null || GitStatus.currentBranch == null) {
		appOutputLogger.error("Can not detect current git status.");
		appOutputLogger.error("Maybe you should init or reset the local git repository.");
		process.exit(1);
	}

	// Check if the port is in use.
	await isPortInUse(PORT).then((inUse) => {
		if (inUse) {
			appOutputLogger.error(`Port ${bold(`${PORT}`)} is already in use. Please try another port.`);
			process.exit(1);
		}
	});

	// Assign webhook routers to the server.
	assignWebhookRouters(server, (payload) => {
		ExecuteShellActions(payload, ACTIONS);
	});

	// Start the server.
	server.listen(PORT, () => {
		appOutputLogger.info(`Server started at ${LOCALHOST_ADDRESS}`);
		console.log("\n");
		console.log(`🚀 Server started at ${cyan(bold(LOCALHOST_ADDRESS))} `);
		console.log(`Listening the remote repo: ${underline(GitStatus!.remoteOriginURL!)}`);
		console.log(`Current branch: ${GitStatus!.currentBranch}`);
		console.log(`Server PID: ${process.pid}, Runtime version: ${process.version}`);
		console.log("Next, use reverse proxy (such as nginx) to map your domain name to this address.");
		console.log("\n");
	});
};

main();
