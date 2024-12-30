import { ACTIONS } from "./config";
import { appOutputLogger, shellCommandOutputLogger } from "./log";
import type { IGithubWebhookPayload } from "./types/payload.type";
import shell from "shelljs";

export const ExecuteShellActions = (_payload: IGithubWebhookPayload) => {
	for (const command of ACTIONS) {
		appOutputLogger.info(`Executing command: ${command}`);

		const result = shell.exec(command, { silent: true });

		if (result.code !== 0) {
			appOutputLogger.error(`Command failed: ${command}`);
			appOutputLogger.error(`Error output: ${result.stderr}`);
			appOutputLogger.error(`Command "${command}" failed with exit code ${result.code}`);
		}

		appOutputLogger.info(`Command succeeded: ${command}`);
		shellCommandOutputLogger.log(`Output: ${result.stdout}`);
	}
};
