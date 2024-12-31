import { GitBranchError, GitPullFromOriginError, GitStatusError } from "@/error/GitError";
import type { IGitStatus } from "@/types/git.type";
import type { IGithubWebhookPayload } from "@/types/payload.type";
import shell from "shelljs";

export function getCurrentGitStatus(): IGitStatus {
	const isInsideWorkTreeResult = shell.exec("git rev-parse --is-inside-work-tree", { silent: true });

	if (isInsideWorkTreeResult.code !== 0 || isInsideWorkTreeResult.stdout.trim() !== "true") {
		throw new GitStatusError(
			"Can not detect current git status. Maybe you should init or reset the local git repository and add remote origin repository.",
		);
	}

	const rawRemoteOriginURLResult = shell.exec("git config --get remote.origin.url", { silent: true });
	if (rawRemoteOriginURLResult.code !== 0 || rawRemoteOriginURLResult.code !== 0) {
		throw new GitStatusError(`Can not detect remote origin repository: ${rawRemoteOriginURLResult.stderr}`);
	}

	const rawCurrentBranchResult = shell.exec("git rev-parse --abbrev-ref HEAD", {
		silent: true,
	});
	if (rawCurrentBranchResult.code !== 0) {
		throw new GitStatusError(`Can not detect current branch: ${rawCurrentBranchResult.stderr}`);
	}

	const stagingAreaResult = shell.exec("git diff --cached --name-only", {
		silent: true,
	});
	if (stagingAreaResult.code !== 0) {
		throw new GitStatusError(`Failed to check staging area: ${stagingAreaResult.stderr}`);
	}

	const unstagedChangesResult = shell.exec("git diff --name-only", {
		silent: true,
	});
	if (unstagedChangesResult.code !== 0) {
		throw new GitStatusError(`Failed to check unstaged changes: ${unstagedChangesResult.stderr}`);
	}

	const remoteOriginURL = rawRemoteOriginURLResult.stdout.trim() || null;
	const currentBranch = rawCurrentBranchResult.stdout.trim() || null;
	const isStagingAreaEmpty = stagingAreaResult.stdout.trim() === "";
	const unstagedFiles = unstagedChangesResult.stdout.trim() ? unstagedChangesResult.stdout.trim().split("\n") : [];

	return {
		remoteOriginURL,
		currentBranch,
		isStagingAreaEmpty,
		unstagedFiles,
	};
}

export function pullFromOrigin(_payload: IGithubWebhookPayload) {
	const fetchResult = shell.exec("git fetch origin", { silent: true });
	if (fetchResult.code !== 0) {
		throw new GitPullFromOriginError(
			"Failed to fetch from origin.",
			fetchResult.code,
			fetchResult.stderr,
			fetchResult.stdout,
		);
	}

	const pullResult = shell.exec("git pull origin", { silent: true });
	if (pullResult.code !== 0) {
		throw new GitPullFromOriginError(
			"Failed to pull from origin.",
			pullResult.code,
			pullResult.stderr,
			pullResult.stdout,
		);
	}
}

export function checkGitBranch(payload: IGithubWebhookPayload, GitStatus: IGitStatus) {
	const masterBranch = payload.repository.master_branch;
	// Check whether current git branch is master branch.
	if (GitStatus!.currentBranch !== masterBranch) {
		throw new GitBranchError(
			`Current branch ${GitStatus!.currentBranch} is not the default branch. Your should checkout the branch ${masterBranch} manually.`,
		);
	}
	// Check whether the changes received is for master branch.
	if (payload.ref !== `refs/heads/${masterBranch}` && payload.ref !== masterBranch) {
		throw new GitBranchError(
			`Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}. So this push event will be ignored.`,
		);
	}
}
