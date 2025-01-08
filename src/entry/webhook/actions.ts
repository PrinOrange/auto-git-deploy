import { GitBranchError } from "@/error/GitError";
import type { IGithubWebhookPayload } from "@/types/payload.type";
import type { WebhookRouter } from "@/types/router.type";
import { executeShells } from "@/libs/shell";
import { pullFromOrigin } from "@/libs/git";

export const checkGitBranch: WebhookRouter = (gitStatus, config) => (req, res) => {
	const payload = req.body as IGithubWebhookPayload;
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

export const checkGitStatus: WebhookRouter = (gitStatus, config) => (req, res) => {
	const payload = req.body as IGithubWebhookPayload;
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

export const executeStopCommand: WebhookRouter = (gitStatus, config) => (req, res, next) => {
	const payload = req.body as IGithubWebhookPayload;
	executeShells(payload, [config.stop]);
	next();
};

export const executeBeforePullCommand: WebhookRouter = (gitStatus, config) => (req, res, next) => {
	const payload = req.body as IGithubWebhookPayload;
	executeShells(payload, config.beforePull);
	next();
};

export const executePullFormOriginCommand: WebhookRouter = (gitStatus, config) => (req, res, next) => {
	const payload = req.body as IGithubWebhookPayload;
	pullFromOrigin();
	next();
};

export const executeAfterPullCommand: WebhookRouter = (gitStatus, config) => (req, res, next) => {
	const payload = req.body as IGithubWebhookPayload;
	executeShells(payload, config.beforePull);
	next();
};

export const executeDeployCommand: WebhookRouter = (gitStatus, config) => (req, res, next) => {
	const payload = req.body as IGithubWebhookPayload;
	executeShells(payload, [config.deploy]);
	next();
};
