import type { Handler } from "express";

export type RouterGenerator = (secret: string | null) => Handler;
