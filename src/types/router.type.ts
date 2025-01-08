import type { Handler } from "express";
import type { IConfig } from "./config.type";
import type { IGitStatus } from "./git.type";

export type WebhookRouter = (gitStatus: IGitStatus | null, config: IConfig) => Handler;
