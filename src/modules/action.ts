import { ACTIONS } from "@/config/config";
import { appOutputLogger, shellCommandOutputLogger } from "@/utils/log";
import type { IGithubWebhookPayload } from "@/types/payload.type";
import shell from "shelljs";

export const ExecuteShellActions = (_payload: IGithubWebhookPayload) => {
	for (const command of ACTIONS) {
		appOutputLogger.info(`Executing command: ${command}`);

		const result = shell.exec(command, { silent: true });

		if (result.code !== 0) {
			appOutputLogger.error(`Command failed: ${command} with exit code ${result.code}`);
			appOutputLogger.error(`${result.stdout}`);
			appOutputLogger.error(`${result.stderr}`);
			return;
		}

		appOutputLogger.info(`Command succeeded: ${command}`);
		shellCommandOutputLogger.log(`Output: ${result.stdout}`);
	}
};
