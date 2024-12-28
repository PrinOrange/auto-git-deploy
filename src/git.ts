import { execSync } from "node:child_process";
import { GitState } from "./types/git.type";

export function getCurrentGitState(): GitState | null {
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
