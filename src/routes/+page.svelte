<script lang="ts">
	import { onMount } from 'svelte';
	import { articles, type Article } from '$lib/api';

	let recentArticles: Article[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const all = await articles.getAll();
			recentArticles = all.slice(0, 5);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load articles';
		} finally {
			loading = false;
		}
	});
</script>

<h1>ダッシュボード</h1>

<div class="dashboard">
	<section class="card">
		<h2>最近の記事</h2>
		{#if loading}
			<p class="loading">読み込み中...</p>
		{:else if error}
			<p class="error">{error}</p>
		{:else if recentArticles.length === 0}
			<p class="empty">記事がありません</p>
		{:else}
			<ul class="article-list">
				{#each recentArticles as article}
					<li>
						<a href="/articles/{article.id}/edit">{article.title}</a>
						<span class="badge badge-{article.status}">{article.status}</span>
					</li>
				{/each}
			</ul>
		{/if}
		<a href="/articles" class="view-all">すべての記事を見る →</a>
	</section>

	<section class="quick-links card">
		<h2>クイックリンク</h2>
		<div class="links">
			<a href="/articles/new" class="btn btn-primary">新規記事作成</a>
			<a href="/categories" class="btn btn-secondary">カテゴリ管理</a>
			<a href="/tags" class="btn btn-secondary">タグ管理</a>
			<a href="/settings" class="btn btn-secondary">設定</a>
		</div>
	</section>
</div>

<style>
	.dashboard {
		display: grid;
		gap: 1.5rem;
		max-width: 800px;
	}

	.article-list {
		list-style: none;
		margin: 1rem 0;
	}

	.article-list li {
		padding: 0.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.article-list li:last-child {
		border-bottom: none;
	}

	.view-all {
		display: block;
		margin-top: 1rem;
		font-size: 0.9rem;
	}

	.quick-links .links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.loading,
	.error,
	.empty {
		color: var(--text-secondary);
		padding: 1rem 0;
	}

	.error {
		color: var(--danger);
	}
</style>
