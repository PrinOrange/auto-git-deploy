import { webhookServer } from "@/entry/webhook-server";
import { initConfig } from "@/utils/config";

const main = async () => {
	const args = process.argv?.slice(2);

	switch (args[0]?.trim() ?? "") {
		case "": {
			await webhookServer();
			return;
		}
		case "init": {
			initConfig();
			return;
		}
		default: {
			console.error(`Unknown option: ${args[0].trim()}`);
			return;
		}
	}
};

main();
