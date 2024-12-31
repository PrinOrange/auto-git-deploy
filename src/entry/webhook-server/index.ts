import { ConfigureError } from "@/error/ConfigError";
import { GitBranchError, GitPullFromOriginError, GitStatusError } from "@/error/GitError";
import { loadConfig } from "@/utils/config";
import { checkGitBranch, getCurrentGitStatus, pullFromOrigin, resetGitWorkspace as resetGitStatus } from "@/utils/git";
import { appOutputLogger, webhookOutputLogger } from "@/utils/log";
import { WebhookServer } from "./server";
import { ShellExecutionError } from "@/error/ShellError";
import { executeShells } from "@/utils/action";
import { logWebhook, processContentType, validateEvent, validateSignature } from "./routers";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "@/types/payload.type";
import { isPortInUse } from "@/libs/port";

export const handleStartWebhookServerCommand = async () => {
	try {
		const gitStatus = getCurrentGitStatus();
		const { PORT: port, COMMANDS: commands, SECRET: secret } = loadConfig();
		const routerGenerators = [logWebhook, processContentType, validateEvent, validateSignature];

		if (await isPortInUse(port)) {
			throw new ConfigureError(`The port ${port} is already in use. Please try another port.`);
		}

		const onReceiveWebHook = (_header: IGithubWebhookRequestHeader, payload: IGithubWebhookPayload) => {
			checkGitBranch(payload, gitStatus);
			resetGitStatus();
			pullFromOrigin(payload);
			executeShells(payload, commands);
		};

		const webHookServer = new WebhookServer(gitStatus, port, secret, routerGenerators, onReceiveWebHook);

		webHookServer.start();
	} catch (error) {
		if (error instanceof GitStatusError) {
			appOutputLogger.error(error.message);
			process.exit(1);
		} else if (error instanceof ConfigureError) {
			appOutputLogger.error(error.message);
			process.exit(1);
		} else if (error instanceof GitBranchError) {
			webhookOutputLogger.error(error.message);
		} else if (error instanceof GitPullFromOriginError) {
			webhookOutputLogger.error(error.message);
		} else if (error instanceof ShellExecutionError) {
			appOutputLogger.error(error.message, error.stderr, error.stdout);
		} else {
			appOutputLogger.error("Unknown error, failed to start webhook server.", error);
			process.exit(1);
		}
	}
};
