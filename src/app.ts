import { handleInitCommand } from "@/entry/config-init";
import { handleStartWebhookServerEntry } from "@/entry/webhook";

enum Command {
	INIT = "init",
	DEFAULT = "",
	START = "start",
}

const main = async () => {
	const args = process.argv.slice(2);
	const command = (args[0]?.trim() ?? "") as Command;

	switch (command) {
		case Command.DEFAULT:
			await handleStartWebhookServerEntry();
			break;
		case Command.START:
			await handleStartWebhookServerEntry();
			break;
		case Command.INIT:
			handleInitCommand();
			break;
		default:
			console.error(`Unknown option: ${command}`);
			process.exit(1);
	}
};

main();
