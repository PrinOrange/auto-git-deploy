import shell from "shelljs";
import type { IGithubWebhookPayload } from "./types/payload.type";
import { GitStatus } from "./git";

export const ExecuteShellActions = (payload: IGithubWebhookPayload, commands: string[]) => {
	if (GitStatus === null) {
		// TODO: actions for case that git status is null.
		return;
	}
	if (GitStatus.currentBranch !== payload.repository.default_branch) {
		// TODO: actions for case that current branch is not the default branch.
		return;
	}

	commands.map((cmd) => {
		console.log(`fake: executing command ${cmd}`);
	});

	// // Execute commands
	// for (const command of commands) {
	// 	const result = shell.exec(command, { silent: true });
	// 	if (result.code !== 0) {
	// 		shell.echo(`命令 ${command} 执行失败`);
	// 		// shell.exit(1); // 如果你想在失败时退出程序
	// 	} else {
	// 		shell.echo(`命令 ${command} 执行成功`);
	// 	}
	// }
};
