import { bold, cyan, underline } from "colors";
import express from "express";
import { ExecuteShellActions } from "./action";
import { appOutputLogger } from "./log";
import { ACTIONS, CONFIG_FILEPATH, initConfig, PORT } from "./config";
import { GitStatus, pullFromOrigin } from "./git";
import { isPortInUse } from "./libs/port";
import { assignWebhookRouters } from "./server";
import { fileExists } from "./libs/file";

const LOCALHOST_ADDRESS = `http:\/\/localhost:${PORT}\/`;

const main = async () => {
	const args = process.argv.slice(2);

	// Is command for init configuration file.
	if (args[0] === "init") {
		if (!fileExists(CONFIG_FILEPATH)) {
			initConfig();
		}
		console.error("Configuration file is already existed.");
		process.exit(0);
	}

	// Check does the configuration file exist.
	if (!fileExists(CONFIG_FILEPATH)) {
		console.error("Configuration file does not exist.");
		console.error("Maybe you should run command 'autodeploy init' first.");
		process.exit(1);
	}

	const server = express();

	// Check if git status is null.
	if (GitStatus == null || GitStatus.currentBranch == null) {
		appOutputLogger.error("Can not detect current git status.");
		appOutputLogger.error("Maybe you should init or reset the local git repository and add remote origin repository.");
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
		pullFromOrigin();
		ExecuteShellActions(payload);
	});

	// Start the server.
	server.listen(PORT, () => {
		appOutputLogger.info(`Server started at ${LOCALHOST_ADDRESS}`);
		console.log("\n");
		console.log("🚀 Server started Successfully...");
		console.log(`${bold("Running on local address:")} ${cyan(LOCALHOST_ADDRESS)}`);
		console.log(`${bold("Listening the remote repo:")} ${underline(GitStatus!.remoteOriginURL!)}`);
		console.log(`${bold("Current branch:")} ${GitStatus!.currentBranch}`);
		console.log(`${bold("Server PID:")} ${process.pid}, ${bold("Runtime version:")} ${process.version}`);
		console.log("Next, use reverse proxy (such as nginx) to map your domain name to this address.");
		console.log("\n");
	});
};

main();
