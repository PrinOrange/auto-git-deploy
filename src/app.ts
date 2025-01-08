import { InitEntry } from "@/entry/init";
import { StartEntry } from "@/entry/webhook";
import { Command, readProgramArgs } from "./utils/args";
import { precheck } from "./utils/precheck";

const main = async () => {
	precheck();
	const command = readProgramArgs();

	switch (readProgramArgs()) {
		case Command.DEFAULT:
			await StartEntry();
			break;
		case Command.START:
			await StartEntry();
			break;
		case Command.INIT:
			InitEntry();
			break;
		default:
			console.error(`Unknown command: ${command}`);
			process.exit(1);
	}
};

main();
