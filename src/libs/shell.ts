import { appOutputLogger, shellCommandOutputLogger } from "@/utils/log";
import type { IGithubWebhookPayload } from "@/types/payload.type";
import shell from "shelljs";
import { ShellExecutionError } from "@/error/ShellError";

export const executeShells = (_payload: IGithubWebhookPayload, commands: string[]) => {
	const execute = (command: string) => {
		const process = shell.exec(command, { silent: true });
		if (process.code !== 0) {
			throw new ShellExecutionError(
				`Command failed: ${command} with exit code ${process.code}`,
				process.code,
				process.stderr,
				process.stdout,
			);
		}
	};

	for (const command of commands) {
		appOutputLogger.info(`Executing command: ${command}`);
		execute(command);
		appOutputLogger.info(`Command succeeded: ${command}`);
		shellCommandOutputLogger.log(`Output: ${process.stdout}`);
	}
};
