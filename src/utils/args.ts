export enum Command {
	INIT = "init",
	DEFAULT = "",
	START = "start",
}

export const readProgramArgs = () => {
	const args = process.argv.slice(2);
	const command = (args[0]?.trim() ?? "") as Command;
	return command;
};
