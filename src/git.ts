import { execSync } from "node:child_process";
import { appOutputLogger } from "./log";
import type { IGitStatus } from "./types/git.type";

/**
 * Pull updates from the remote.origin of the current Git repository.
 */
export function pullFromOrigin() {
	try {
		// Fetch remote updates
		execSync("git fetch origin", { stdio: "inherit" });

		// Pull updates for the current branch
		const output = execSync("git pull origin", { encoding: "utf-8" });
		appOutputLogger.info(output.trim());
	} catch (error) {
		if (error instanceof Error) {
			appOutputLogger.error(`Error pulling from origin: ${error.message}`);
			return;
		}
		appOutputLogger.error("An unknown error occurred while pulling from origin.");
	}
}

function getCurrentGitStatus(): IGitStatus | null {
	try {
		const isInsideWorkTree = execSync("git rev-parse --is-inside-work-tree", {
			encoding: "utf-8",
		}).trim();

		if (isInsideWorkTree !== "true") return null;

		const rawRemoteOriginURL = execSync("git config --get remote.origin.url", {
			encoding: "utf-8",
		}).trim();
		const rawCurrentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
		}).trim();

		const remoteOriginURL = rawRemoteOriginURL.length > 0 ? rawRemoteOriginURL : null;
		const currentBranch = rawCurrentBranch.length > 0 ? rawCurrentBranch : null;

		return {
			remoteOriginURL,
			currentBranch,
		};
	} catch (error) {
		return null;
	}
}

export const GitStatus = getCurrentGitStatus();
