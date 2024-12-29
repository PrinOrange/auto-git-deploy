import { execSync } from "node:child_process";
import type { IGitStatus } from "./types/git.type";

function getCurrentGitStatus(): IGitStatus | null {
	try {
		const rawRemoteURL = execSync("git config --get remote.origin.url", {
			encoding: "utf-8",
		}).trim();
		const rawCurrentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
		}).trim();

		const remoteURL = rawRemoteURL.length > 0 ? rawRemoteURL : null;
		const currentBranch = rawCurrentBranch.length > 0 ? rawCurrentBranch : null;

		return {
			remoteURL,
			currentBranch,
		};
	} catch (error) {
		console.error("Error getting Git information:", error);
		return null;
	}
}

export const GitStatus = getCurrentGitStatus();
