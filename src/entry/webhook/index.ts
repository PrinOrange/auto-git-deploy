import { ConfigureError } from "@/error/ConfigError";
import { isPortInUse } from "@/libs/port";
import { loadConfig } from "@/utils/config";
import { getCurrentGitStatus } from "@/utils/git";
import {
	checkGitBranch,
	checkGitStatus,
	executeAfterPullCommand,
	executeBeforePullCommand,
	executeDeployCommand,
	executePullFormOriginCommand,
	executeStopCommand,
} from "./actions";
import { logWebhook, validateContentType, validateEvent, validateSignature } from "./routers";
import { WebhookServer } from "./server";

export const handleStartWebhookServerEntry = async () => {
	const gitStatus = getCurrentGitStatus();

	const config = loadConfig();

	if (await isPortInUse(config.PORT)) {
		throw new ConfigureError(`The port ${config.PORT} is already in use. Please try another port.`);
	}

	const webHookServer = new WebhookServer(gitStatus, config);

	webHookServer
		// Use request middlewares
		.useRouter(logWebhook)
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
