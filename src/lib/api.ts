const API_BASE = 'http://localhost:8080/api';
export const API_BASE_URL = API_BASE;

// Types
export interface Category {
	id: number;
	name: string;
	slug: string;
	created_at: string;
}

export interface Tag {
	id: number;
	name: string;
	slug: string;
	created_at: string;
}

export interface Article {
	id: number;
	title: string;
	slug: string;
	content: string;
	status: 'draft' | 'published';
	author_id: number;
	category_id: number | null;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	tags: Tag[];
}

// API Client
async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		}
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: 'Unknown error' }));
		throw new Error(error.error || 'Request failed');
	}

	if (res.status === 204) {
		return null as T;
	}

	return res.json();
}

// Articles
export const articles = {
	getAll: () => request<Article[]>('/articles'),
	getById: (id: number) => request<Article>(`/articles/${id}`),
	create: (data: {
		title: string;
		slug: string;
		content: string;
		status?: string;
		author_id: number;
		category_id?: number | null;
		tag_ids?: number[];
	}) => request<Article>('/articles', { method: 'POST', body: JSON.stringify(data) }),
	update: (
		id: number,
		data: {
			title: string;
			slug: string;
			content: string;
			status?: string;
			category_id?: number | null;
			tag_ids?: number[];
		}
	) => request<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
	publish: (id: number) => request<Article>(`/articles/${id}/publish`, { method: 'POST' }),
	delete: (id: number) => request<void>(`/articles/${id}`, { method: 'DELETE' })
};

// Categories
export const categories = {
	getAll: () => request<Category[]>('/categories'),
	create: (data: { name: string; slug: string }) =>
		request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
	update: (id: number, data: { name: string; slug: string }) =>
		request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
	delete: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' })
};

// Tags
export const tags = {
	getAll: () => request<Tag[]>('/tags'),
	create: (data: { name: string; slug: string }) =>
		request<Tag>('/tags', { method: 'POST', body: JSON.stringify(data) }),
	update: (id: number, data: { name: string; slug: string }) =>
		request<Tag>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
	delete: (id: number) => request<void>(`/tags/${id}`, { method: 'DELETE' })
};

// Export
export const exportSite = {
	run: () =>
		request<{ message: string; export_dir: string }>('/export', {
			method: 'POST',
			body: JSON.stringify({})
		})
};

// Settings
export interface Settings {
	export_dir: string;
	site_title: string;
}

export const settings = {
	get: () => request<Settings>('/settings'),
	update: (data: Settings) =>
		request<Settings>('/settings', { method: 'POST', body: JSON.stringify(data) })
};

// Images
export const images = {
	upload: async (file: File): Promise<{ filename: string; url: string }> => {
		const formData = new FormData();
		formData.append('image', file);
		const res = await fetch(`${API_BASE}/images`, {
			method: 'POST',
			body: formData
		});
		if (!res.ok) {
			const error = await res.json().catch(() => ({ error: 'Upload failed' }));
			throw new Error(error.error || 'Upload failed');
		}
		return res.json();
	}
};

// Templates
export interface Template {
	id: number;
	name: string;
	content: string;
	created_at: string;
	updated_at: string;
}

export const templates = {
	getAll: () => request<Template[]>('/templates'),
	getByName: (name: string) => request<Template>(`/templates/${name}`),
	upload: async (name: string, file: File): Promise<Template> => {
		const formData = new FormData();
		formData.append('file', file);
		const res = await fetch(`${API_BASE}/templates/${name}/upload`, {
			method: 'POST',
			body: formData
		});
		if (!res.ok) {
			const error = await res.json().catch(() => ({ error: 'Upload failed' }));
			throw new Error(error.error || 'Upload failed');
		}
		return res.json();
	},
	import: async (file: File): Promise<{ message: string; imported: string[]; errors: string[] }> => {
		const formData = new FormData();
		formData.append('file', file);
		const res = await fetch(`${API_BASE}/templates/import`, {
			method: 'POST',
			body: formData
		});
		if (!res.ok) {
			const error = await res.json().catch(() => ({ error: 'Import failed' }));
			throw new Error(error.error || 'Import failed');
		}
		return res.json();
	},
	reset: () => request<{ message: string }>('/templates/reset', { method: 'POST' })
};
