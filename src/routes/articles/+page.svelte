<script lang="ts">
	import { onMount } from 'svelte';
	import { articles, type Article } from '$lib/api';

	let articleList: Article[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		await loadArticles();
	});

	async function loadArticles() {
		loading = true;
		try {
			articleList = await articles.getAll();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id: number) {
		if (!confirm('この記事を削除しますか？')) return;
		try {
			await articles.delete(id);
			await loadArticles();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Delete failed');
		}
	}

	async function handleToggleStatus(id: number) {
		try {
			await articles.toggleStatus(id);
			await loadArticles();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Status toggle failed');
		}
	}
</script>

<div class="header">
	<h1>記事一覧</h1>
	<a href="/articles/new" class="btn btn-primary">新規作成</a>
</div>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<p class="error">{error}</p>
{:else}
	<div class="card">
		<table>
			<thead>
				<tr>
					<th>タイトル</th>
					<th>ステータス</th>
					<th>更新日</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				{#each articleList as article}
					<tr>
						<td>
							<a href="/articles/{article.id}/edit">{article.title}</a>
						</td>
						<td>
							<span class="badge badge-{article.status}">{article.status}</span>
						</td>
						<td>{new Date(article.updated_at).toLocaleDateString('ja-JP')}</td>
						<td class="actions">
							<button
								class={article.status === 'draft' ? 'btn-success' : 'btn-secondary'}
								onclick={() => handleToggleStatus(article.id)}
							>
								{article.status === 'draft' ? '公開' : '下書きに戻す'}
							</button>
							<a href="/articles/{article.id}/edit" class="btn btn-secondary">編集</a>
							<button class="btn-danger" onclick={() => handleDelete(article.id)}>削除</button>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="empty">記事がありません</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.header h1 {
		margin: 0;
	}

	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions button,
	.actions .btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	.empty {
		text-align: center;
		color: var(--text-secondary);
		padding: 2rem;
	}

	.error {
		color: var(--danger);
	}
</style>

