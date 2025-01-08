import { GitPullFromOriginError, GitStatusError } from "@/error/GitError";
import type { IGitStatus } from "@/types/git.type";
import * as shell from "shelljs";
import { appOutputLogger } from "../utils/log";

export function isInGitRepo() {
	const isInsideWorkTree = shell.exec("git rev-parse --is-inside-work-tree", { silent: true });
	if (isInsideWorkTree.code !== 0 || isInsideWorkTree.stdout.trim() !== "true") {
		return false;
	}
	return true;
}

export function getGitStatus(): IGitStatus {
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

/*
 * Clean untracked files and restore unstaged changes in a Git repository.
 */
export function resetGitWorkspace() {
	// Remove untracked files and directories
	const cleanResult = shell.exec("git clean -fd", { silent: true });
	if (cleanResult.code !== 0) {
		throw new GitStatusError(`Failed to clean untracked files: ${cleanResult.stderr}`);
	}

	// Restore unstaged changes to the last commit
	const restoreResult = shell.exec("git restore .", { silent: true });
	if (restoreResult.code !== 0) {
		throw new GitStatusError(`Failed to restore unstaged changes: ${restoreResult.stderr}`);
	}
	appOutputLogger.info("Git workspace has been reset: untracked files removed and unstaged changes restored.");
}

export function isFileIgnoredByGit(filePath: string): boolean {
	const result = shell.exec(`git check-ignore ${filePath}`, { silent: true });
	return result.code === 0 && result.stdout.trim().length > 0;
}

export function pullFromOrigin() {
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
