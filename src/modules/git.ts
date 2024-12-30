import { appOutputLogger } from "@/utils/log";
import type { IGitStatus } from "@/types/git.type";
import shell from "shelljs";
import type { IGithubWebhookPayload } from "@/types/payload.type";

function getCurrentGitStatus(): IGitStatus | null {
	try {
		// Check if inside a Git work tree
		const isInsideWorkTreeResult = shell.exec("git rev-parse --is-inside-work-tree", { silent: true });

		if (isInsideWorkTreeResult.code !== 0 || isInsideWorkTreeResult.stdout.trim() !== "true") {
			return null;
		}

		// Get remote origin URL
		const rawRemoteOriginURLResult = shell.exec("git config --get remote.origin.url", { silent: true });
		const rawCurrentBranchResult = shell.exec("git rev-parse --abbrev-ref HEAD", { silent: true });

		// Check if commands were successful
		if (rawRemoteOriginURLResult.code !== 0 || rawCurrentBranchResult.code !== 0) {
			return null;
		}

		// Check if the staging area is empty
		const stagingAreaResult = shell.exec("git diff --cached --name-only", {
			silent: true,
		});

		if (stagingAreaResult.code !== 0) {
			console.error(`Failed to check staging area: ${stagingAreaResult.stderr}`);
			return null;
		}

		// Parse results
		const remoteOriginURL = rawRemoteOriginURLResult.stdout.trim() || null;
		const currentBranch = rawCurrentBranchResult.stdout.trim() || null;
		const isStagingAreaEmpty = stagingAreaResult.stdout.trim() === "";

		return {
			remoteOriginURL,
			currentBranch,
			isStagingAreaEmpty,
		};
	} catch (error) {
		console.error("An unexpected error occurred:", error);
		return null;
	}
}

export const GitStatus = getCurrentGitStatus();

export function checkGitBranch(payload: IGithubWebhookPayload): boolean {
	const masterBranch = payload.repository.master_branch;
	// Check whether current git branch is master branch.
	if (GitStatus!.currentBranch !== masterBranch) {
		appOutputLogger.error(`Current branch ${GitStatus!.currentBranch} is not the default branch.`);
		appOutputLogger.error(`Your should checkout the branch ${masterBranch} manually.`);
		return false;
	}
	// Check whether the changes received is for master branch.
	if (payload.ref !== `refs/heads/${masterBranch}` && payload.ref !== masterBranch) {
		appOutputLogger.error(`Invalid reference: ${payload.ref} is not expected refs/heads/${masterBranch}`);
		appOutputLogger.error("So this push event will be ignored.");
		return false;
	}
	return true;
}

export function checkGitStatus(): boolean {
	// Check if git status is null.
	if (GitStatus == null || GitStatus.currentBranch == null) {
		appOutputLogger.error("Can not detect current git status.");
		appOutputLogger.error("Maybe you should init or reset the local git repository and add remote origin repository.");
		return false;
	}

	// Ensure the git stategy area is empty, for avoid pull conflicts.
	if (!GitStatus.isStagingAreaEmpty) {
		appOutputLogger.error("Your git stategy area is not empty. Please commit current strategy files.");
		return false;
	}
	return true;
}

export function pullFromOrigin(): boolean {
	try {
		// Fetch remote updates
		appOutputLogger.info("Fetching updates from origin...");
		const fetchResult = shell.exec("git fetch origin", { silent: true });

		if (fetchResult.code !== 0) {
			appOutputLogger.error("Failed to fetch from origin.");
			appOutputLogger.error(fetchResult.stderr);
			appOutputLogger.error(fetchResult.stdout);
			return false;
		}

		// Pull updates for the current branch
		appOutputLogger.info("Pulling updates from origin...");
		const pullResult = shell.exec("git pull origin", { silent: true });

		if (pullResult.code !== 0) {
			appOutputLogger.error("Failed to pull from origin.");
			appOutputLogger.error(pullResult.stderr);
			appOutputLogger.error(pullResult.stdout);
			return false;
		}

		appOutputLogger.info("Successfully pulled updates from origin.");
		appOutputLogger.info(pullResult.stdout.trim());
		return true;
	} catch (error) {
		appOutputLogger.error("An unexpected error occurred.");
		appOutputLogger.error(error);
		return false;
	}
}
