import shell from "shelljs";
import { GithubWebhookPayload } from "./types/payload.type";
import { getCurrentGitState } from "./git";

export const ExecuteActions = (
	payload: GithubWebhookPayload,
	commands: string[],
) => {
	const gitStatus = getCurrentGitState();
	if (gitStatus === null) {
		return;
	}
	if (gitStatus.currentBranch !== payload.repository.default_branch) {
		return;
	}

	commands.forEach((command) => {
		const result = shell.exec(command, { silent: true });
		if (result.code !== 0) {
			shell.echo(`命令 ${command} 执行失败`);
			// shell.exit(1); // 如果你想在失败时退出程序
		} else {
			shell.echo(`命令 ${command} 执行成功`);
		}
	});
};
