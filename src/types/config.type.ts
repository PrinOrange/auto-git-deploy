export interface IConfig {
	PORT: number;
	SECRET?: string | null;
	ACTIONS: string[];
	LOG_PATH: string;
}
