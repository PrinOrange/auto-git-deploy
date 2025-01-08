export interface IConfig {
	port: number;
	secret: string | null;

	deploy: string;
	stop: string;

	beforePull: string[];
	afterPull: string[];
}
