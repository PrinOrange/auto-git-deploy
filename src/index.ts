import envSchema from "env-schema";

const schema = {
	type: "object",
	required: ["WEBHOOK_LISTENING_PORT", "WEBHOOK_SECRET"],
	properties: {
		WEBHOOK_LISTENING_PORT: { type: "string", default: "3000" },
		WEBHOOK_SECRET: { type: "string", default: null },
	},
};

const environmentVariables = envSchema({ schema, dotenv: true });

console.log("Port Number:", environmentVariables.WEBHOOK_LISTENING_PORT);
console.log("Secret:", environmentVariables.WEBHOOK_SECRET);
