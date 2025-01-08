import type { Handler } from "express";
import type { IGithubWebhookPayload, IGithubWebhookRequestHeader } from "./payload.type";
import type { IGitStatus } from "./git.type";
import type { IConfig } from "./config.type";

export type WebhookRouter = (secret: string | null) => Handler;
export type WebhookAction = (
	header: IGithubWebhookRequestHeader,
	payload: IGithubWebhookPayload,
	gitStatus: IGitStatus | null,
	config: IConfig,
) => void;
