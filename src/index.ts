import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Args {
	repo: string;
	port: number;
	secret: string;
}

const argv = yargs(hideBin(process.argv))
	.scriptName("auto-git-deploy")
	.usage("$0 [args]")
	.option("repo", {
		alias: "r",
		type: "string",
		demandOption: true,
		description: "GitHub remote repository URL (required)",
	})
	.option("port", {
		alias: "p",
		type: "number",
		default: 3300,
		description: "Port number for the server (optional, default: 3300)",
	})
	.option("secret", {
		alias: "s",
		type: "string",
		default: "",
		description: "Secret token for authentication (optional, default: empty)",
	})
	.check((argv) => {
		if (
			!/^(https?:\/\/|git@)github\.com[/:][\w\-]+\/[\w\-]+(\.git)?$/.test(
				argv.repo,
			)
		) {
			throw new Error("Invalid repository URL. It must start with 'https'.");
		}
		if (argv.port <= 0) {
			throw new Error("Port must be a positive number.");
		}
		return true;
	})
	.help().argv as Args;

console.log("GitHub Repository URL:", argv.repo);
console.log("Port Number:", argv.port);
console.log("Secret:", argv.secret || "No secret provided");
