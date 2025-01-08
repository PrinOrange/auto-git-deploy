import { appOutputLogger, shellCommandOutputLogger } from "@/utils/log";
import type { IGithubWebhookPayload } from "@/types/payload.type";
import shell from "shelljs";
import { ShellExecutionError } from "@/error/ShellError";

export const executeShell = (_payload: IGithubWebhookPayload, command: string) => {
	const execute = (_command: string) => {
		const process = shell.exec(_command, { silent: true });
		if (process.code !== 0) {
			throw new ShellExecutionError(
				`Command failed: ${_command} with exit code ${process.code}`,
				process.code,
				process.stderr,
				process.stdout,
			);
		}
	};

	appOutputLogger.info(`Executing command: ${command}`);
	execute(command);
	appOutputLogger.info(`Command succeeded: ${command}`);
	shellCommandOutputLogger.log(`Output: ${process.stdout}`);
};
