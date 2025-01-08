import { ConfigureError } from "@/error/ConfigError";
import { isPortInUse } from "@/libs/port";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "@/types/payload.type";
import { executeShells } from "@/utils/action";
import { loadConfig } from "@/utils/config";
import { getCurrentGitStatus, pullFromOrigin, resetGitWorkspace as resetGitStatus } from "@/utils/git";
import { checkGitBranch, checkGitStatus } from "./actions";
import { logWebhook, processContentType, validateEvent, validateSignature } from "./routers";
import { WebhookServer } from "./server";

export const handleStartWebhookServerEntry = async () => {
	const gitStatus = getCurrentGitStatus();

	const config = loadConfig();

	if (await isPortInUse(config.PORT)) {
		throw new ConfigureError(`The port ${config.PORT} is already in use. Please try another port.`);
	}

	const onReceiveWebHook = (_header: IGithubWebhookRequestHeader, payload: IGithubWebhookPayload) => {
		resetGitStatus();

		executeShells(payload, [stopCommand]);

		executeShells(payload, beforePullCommands);

		pullFromOrigin(payload);

		executeShells(payload, afterPullCommands);

		executeShells(payload, [deployCommand]);
	};

	const webHookServer = new WebhookServer(gitStatus, config);

	webHookServer
		// Use request middlewares
		.useRouter(logWebhook)
		.useRouter(processContentType)
		.useRouter(validateEvent)
		.useRouter(validateSignature)
		// Use actions after received webhook.
		.useAction(checkGitBranch)
		.useAction(checkGitStatus)
		.start();
};
