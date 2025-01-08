import { GitBranchError } from "@/error/GitError";
import type { WebhookAction } from "@/types/router.type";
import { executeShells } from "@/utils/action";

export const checkGitBranch: WebhookAction = (header, payload, GitStatus) => {
	const masterBranch = payload.repository.master_branch;
	// Check whether current git branch is master branch.
	if (GitStatus!.currentBranch !== masterBranch) {
		throw new GitBranchError(
			`Current branch ${
				GitStatus!.currentBranch
			} is not the default branch. Your should checkout the branch ${masterBranch} manually.`,
		);
	}
	// Check whether the changes received is for master branch.
	if (payload.ref !== `refs/heads/${masterBranch}` && payload.ref !== masterBranch) {
		throw new GitBranchError(
			`Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}. So this push event will be ignored.`,
		);
	}
};

export const checkGitStatus: WebhookAction = (header, payload, gitStatus) => {
	const masterBranch = payload.repository.master_branch;
	// Check whether current git branch is master branch.
	if (gitStatus!.currentBranch !== masterBranch) {
		throw new GitBranchError(
			`Current branch ${
				gitStatus!.currentBranch
			} is not the default branch. Your should checkout the branch ${masterBranch} manually.`,
		);
	}
	// Check whether the changes received is for master branch.
	if (payload.ref !== `refs/heads/${masterBranch}` && payload.ref !== masterBranch) {
		throw new GitBranchError(
			`Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}. So this push event will be ignored.`,
		);
	}
};

export const executeStopCommand: WebhookAction = (header, payload, gitStatus, config) => {
	executeShells(payload, [config.STOP]);
};
