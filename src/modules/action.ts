import { appOutputLogger, shellCommandOutputLogger } from "@/utils/log";
import type { IGithubWebhookPayload } from "@/types/payload.type";
import shell from "shelljs";

export const ExecuteShellActions = (_payload: IGithubWebhookPayload, actions: string[]) => {
	for (const command of actions) {
		appOutputLogger.info(`Executing command: ${command}`);

		const process = shell.exec(command, { silent: true });

		if (process.code !== 0) {
			appOutputLogger.error(`Command failed: ${command} with exit code ${process.code}`);
			appOutputLogger.error(`${process.stdout}`);
			appOutputLogger.error(`${process.stderr}`);
			return;
		}

		appOutputLogger.info(`Command succeeded: ${command}`);
		shellCommandOutputLogger.log(`Output: ${process.stdout}`);
	}
};
