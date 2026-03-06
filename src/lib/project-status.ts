export interface ProjectStatus {
	name: string;
	fullName: string;
	description: string;
	url: string;
	updatedAt: string;
	stars: number;
	openIssues: number;
	language: string | null;
}

export interface ProjectStatusResult {
	items: ProjectStatus[];
	error: string | null;
	source: string;
}

const GITHUB_API_BASE = 'https://api.github.com';

let cache: Promise<ProjectStatusResult> | undefined;

function getAuthHeaders() {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		return { Accept: 'application/vnd.github+json' };
	}
	return {
		Accept: 'application/vnd.github+json',
		Authorization: `Bearer ${token}`,
	};
}

function normalizeRepo(value: string) {
	return value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
}

async function fetchRepo(fullName: string): Promise<ProjectStatus | null> {
	const response = await fetch(`${GITHUB_API_BASE}/repos/${fullName}`, {
		headers: getAuthHeaders(),
	});
	if (!response.ok) {
		return null;
	}
	const data = await response.json();
	return {
		name: data.name,
		fullName: data.full_name,
		description: data.description ?? '',
		url: data.html_url,
		updatedAt: data.updated_at,
		stars: data.stargazers_count,
		openIssues: data.open_issues_count,
		language: data.language,
	};
}

async function fetchOwnerRepos(owner: string): Promise<ProjectStatus[]> {
	const query = new URLSearchParams({
		sort: 'updated',
		per_page: '6',
	});
	const response = await fetch(`${GITHUB_API_BASE}/users/${owner}/repos?${query.toString()}`, {
		headers: getAuthHeaders(),
	});
	if (!response.ok) {
		return [];
	}
	const rows = await response.json();
	return rows.map((data: any) => ({
		name: data.name,
		fullName: data.full_name,
		description: data.description ?? '',
		url: data.html_url,
		updatedAt: data.updated_at,
		stars: data.stargazers_count,
		openIssues: data.open_issues_count,
		language: data.language,
	}));
}

async function loadProjectStatus(): Promise<ProjectStatusResult> {
	try {
		const configuredRepos = (process.env.PROJECT_REPOS ?? '')
			.split(',')
			.map(normalizeRepo)
			.filter(Boolean);

		if (configuredRepos.length > 0) {
			const entries = await Promise.all(configuredRepos.map((fullName) => fetchRepo(fullName)));
			return {
				items: entries.filter((entry): entry is ProjectStatus => entry !== null),
				error: null,
				source: 'repos',
			};
		}

		const owner = process.env.PROJECT_OWNER?.trim();
		if (!owner) {
			return {
				items: [],
				error: null,
				source: 'disabled',
			};
		}

		const items = await fetchOwnerRepos(owner);
		return {
			items,
			error: null,
			source: 'owner',
		};
	} catch (error) {
		return {
			items: [],
			error: error instanceof Error ? error.message : 'Unknown GitHub API error',
			source: 'error',
		};
	}
}

export async function getProjectStatus(): Promise<ProjectStatusResult> {
	if (!cache) {
		cache = loadProjectStatus();
	}
	return cache;
}
