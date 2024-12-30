import { checkConfigExist, PORT } from "@/config/config";
import { ExecuteShellActions } from "@/modules/action";
import { GitStatus, checkGitBranch, checkGitStatus, pullFromOrigin } from "@/modules/git";
import { assignWebhookRouters, checkPortAvailability } from "@/modules/server";
import { appOutputLogger } from "@/utils/log";
import { bold, cyan, underline } from "colors";
import express from "express";

const LOCALHOST_ADDRESS = `http:\/\/localhost:${PORT}\/`;

const checkEnvironment = async () => {
	// Check does the configuration file exist.
	!checkConfigExist() && process.exit(1);
	// Check is git status ready.
	!checkGitStatus() && process.exit(1);
	// Check if the port is in use.
	!(await checkPortAvailability()) && process.exit(1);
};

export const webhookServer = async () => {
	await checkEnvironment();

	const server = express();

	// Assign webhook routers to the server.
	assignWebhookRouters(server, (payload) => {
		// Execute shell actions only if git pull successes.
		if (checkGitBranch(payload) && pullFromOrigin()) {
			ExecuteShellActions(payload);
		}
	});

	// Start the server.
	server.listen(PORT, () => {
		appOutputLogger.info(`Server started at ${LOCALHOST_ADDRESS}`);
		console.log("🚀 Server started Successfully...");
		console.log(`${bold("Running on local address:")} ${cyan(LOCALHOST_ADDRESS)}`);
		console.log(`${bold("Listening the remote repo:")} ${underline(GitStatus!.remoteOriginURL!)}`);
		console.log(`${bold("Current branch:")} ${GitStatus!.currentBranch}`);
		console.log(`${bold("Server PID:")} ${process.pid}, ${bold("Runtime version:")} ${process.version}`);
		console.log("Next, use reverse proxy (such as nginx) to map your domain name to this address.");
	});
};
