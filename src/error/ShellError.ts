export class ShellExecutionError extends Error {
	public readonly code: number;
	public readonly stderr?: string;
	public readonly stdout?: string;

	constructor(message: string, code: number, stderr?: string, stdout?: string) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.stderr = stderr;
		this.stdout = stdout;

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
