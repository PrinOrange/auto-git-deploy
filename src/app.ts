import { handleInitCommand } from "@/entry/config-init";
import { handleStartWebhookServerCommand } from "@/entry/webhook-server";

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
			await handleStartWebhookServerCommand();
			break;
		case Command.START:
			await handleStartWebhookServerCommand();
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
