import { ExecuteShellActions } from "@/modules/action";
import { GitStatus, checkGitBranch, checkGitStatus, pullFromOrigin } from "@/modules/git";
import { assignWebhookRouters, checkPortAvailability } from "@/modules/server";
import { checkConfigExist } from "@/utils/config";
import { appOutputLogger } from "@/utils/log";
import { bold, cyan, underline } from "colors";
import express from "express";
import { CONFIG_FILENAME } from "@/consts/consts";
import fs from "node:fs";
import { z } from "zod";

const configSchema = z.object({
	PORT: z.number().default(3000),
	SECRET: z.string().nullable(),
	ACTIONS: z.array(z.string()).default([]),
});

const loadConfig = () => {
	try {
		const fileContent = fs.readFileSync(CONFIG_FILENAME, "utf-8");
		const parsedContent = JSON.parse(fileContent);
		return configSchema.parse(parsedContent);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Configuration validation failed.");
			for (const err of error.errors) {
				console.error(`- ${err.path.join(".")}: ${err.message}`);
			}
		} else {
			console.error("Error reading or parsing configuration file:", error);
		}
		process.exit(1);
	}
};

export const CONFIG = loadConfig();

export const PORT = CONFIG.PORT;
export const SECRET = CONFIG.SECRET;
export const ACTIONS = CONFIG.ACTIONS;

const LOCALHOST_ADDRESS = `http:\/\/localhost:${PORT}\/`;

const checkEnvironment = async () => {
	// Check does the configuration file exist.
	!checkConfigExist() && process.exit(1);
	// Check is git status ready.
	!checkGitStatus() && process.exit(1);
	// Check if the port is in use.
	!(await checkPortAvailability(PORT)) && process.exit(1);
};

export const webhookServer = async () => {
	await checkEnvironment();

	const server = express();

	// Assign webhook routers to the server.
	assignWebhookRouters(server, SECRET, (_header, payload) => {
		// Execute shell actions only if git pull successes.
		if (checkGitBranch(payload) && pullFromOrigin()) {
			ExecuteShellActions(payload, ACTIONS);
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
