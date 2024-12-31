export interface IConfig {
	PORT: number;
	SECRET: string | null;

	DEPLOY: string | null;
	STOP: string | null;

	BEFORE_PULL: string[];
	AFTER_PULL: string[];
}
