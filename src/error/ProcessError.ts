export class ProcessError extends Error {
	public readonly stderr?: string;

	constructor(message: string, stderr?: string) {
		super(message);
		this.name = this.constructor.name;
		this.stderr = stderr;

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
