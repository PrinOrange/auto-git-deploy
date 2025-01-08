export interface IConfig {
	PORT: number;
	SECRET: string | null;

	DEPLOY: string;
	STOP: string;

	BEFORE_PULL: string[];
	AFTER_PULL: string[];
}
