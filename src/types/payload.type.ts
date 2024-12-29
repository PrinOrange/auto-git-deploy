export interface IGithubWebhookRequestHeader {
	host: string;
	"x-real-ip": string;
	"x-forwarded-for": string;
	"x-forwarded-proto": string;
	connection: string;
	"content-length": string;
	"user-agent": string;
	accept: string;
	"content-type": string;
	"x-github-delivery": string;
	"x-github-event": string;
	"x-github-hook-id": string;
	"x-github-hook-installation-target-id": string;
	"x-github-hook-installation-target-type": string;
	"x-hub-signature"?: string; // For sha1 verification
	"x-hub-signature-256"?: string; // For sha256 verification
}

export interface IGithubWebhookPayload {
	ref: string;
	before: string;
	after: string;
	repository: {
		id: number;
		node_id: string;
		name: string;
		full_name: string;
		private: boolean;
		owner: {
			name: string;
			email: string;
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		html_url: string;
		description: string | null;
		fork: boolean;
		url: string;
		created_at: number;
		updated_at: string;
		pushed_at: number;
		git_url: string;
		ssh_url: string;
		clone_url: string;
		svn_url: string;
		homepage: string | null;
		size: number;
		stargazers_count: number;
		watchers_count: number;
		language: string | null;
		has_issues: boolean;
		has_projects: boolean;
		has_downloads: boolean;
		has_wiki: boolean;
		has_pages: boolean;
		has_discussions: boolean;
		forks_count: number;
		archived: boolean;
		disabled: boolean;
		open_issues_count: number;
		license: string | null;
		allow_forking: boolean;
		is_template: boolean;
		visibility: string;
		default_branch: string;
		master_branch: string;
	};
	pusher: {
		name: string;
		email: string;
	};
	sender: {
		login: string;
		id: number;
		node_id: string;
		avatar_url: string;
		url: string;
		html_url: string;
		type: string;
		site_admin: boolean;
	};
	created: boolean;
	deleted: boolean;
	forced: boolean;
	compare: string;
	commits: {
		id: string;
		tree_id: string;
		distinct: boolean;
		message: string;
		timestamp: string;
		url: string;
		author: {
			name: string;
			email: string;
			username: string;
		};
		committer: {
			name: string;
			email: string;
			username: string;
		};
		added: string[];
		removed: string[];
		modified: string[];
	}[];
	head_commit: {
		id: string;
		tree_id: string;
		distinct: boolean;
		message: string;
		timestamp: string;
		url: string;
		author: {
			name: string;
			email: string;
			username: string;
		};
		committer: {
			name: string;
			email: string;
			username: string;
		};
		added: string[];
		removed: string[];
		modified: string[];
	};
}
