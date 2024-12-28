import { execSync } from "node:child_process";

export function getGitInfo() {
	try {
		const remoteUrl = execSync("git remote get-url origin", {
			encoding: "utf-8",
		}).trim();
		const match = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
		const repoName = match ? match[1] : null;

		return { remoteUrl, repoName };
	} catch (error) {
		return { remoteUrl: null, repoName: null };
	}
}
