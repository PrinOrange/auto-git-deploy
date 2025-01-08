import { ConfigureError } from "@/error/ConfigError";
import { isPortInUse } from "@/libs/port";
import { loadConfig } from "@/utils/config";
import { getGitStatus } from "@/libs/git";
import {
	checkGitBranch,
	checkGitStatus,
	executeAfterPullCommand,
	executeBeforePullCommand,
	executeDeployCommand,
	executePullFormOriginCommand,
	executeStopCommand,
} from "./actions";
import { logWebhookRequest, validateContentType, validateEvent, validateSignature } from "./routers";
import { WebhookServer } from "./server";

export const StartEntry = async () => {
	const gitStatus = getGitStatus();
	const config = loadConfig();

	if (await isPortInUse(config.port)) {
		throw new ConfigureError(`The port ${config.port} is already in use. Please try another port.`);
	}

	new WebhookServer(gitStatus, config)
		// Use request middlewares
		.useRouter(logWebhookRequest)
		.useRouter(validateContentType)
		.useRouter(validateEvent)
		.useRouter(validateSignature)
		// Use actions after received webhook.
		.useRouter(checkGitBranch)
		.useRouter(checkGitStatus)
		.useRouter(executeStopCommand)
		.useRouter(executeBeforePullCommand)
		.useRouter(executePullFormOriginCommand)
		.useRouter(executeAfterPullCommand)
		.useRouter(executeDeployCommand)
		.start();
};
