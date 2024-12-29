import { execSync } from "node:child_process";
import type { IGitState } from "./types/git.type";

function getCurrentGitStatus(): IGitState | null {
	try {
		const remoteUrl = execSync("git config --get remote.origin.url", {
			encoding: "utf-8",
		}).trim();
		const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
		}).trim();
		return {
			remoteUrl,
			currentBranch,
		};
	} catch (error) {
		console.error("Error getting Git information:", error);
		return null;
	}
}

export const GitStatus = getCurrentGitStatus();
