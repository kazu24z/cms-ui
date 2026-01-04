<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { articles, categories, tags, type Category, type Tag, type Article } from '$lib/api';
	import ArticleEditor from '$lib/components/ArticleEditor.svelte';

	let title = $state('');
	let slug = $state('');
	let content = $state('');
	let categoryId: number | null = $state(null);
	let selectedTagIds: number[] = $state([]);

	let categoryList: Category[] = $state([]);
	let tagList: Tag[] = $state([]);
	let article: Article | null = $state(null);
	let loading = $state(true);

	$effect(() => {
		const id = Number($page.params.id);
		if (id) {
			loadData(id);
		}
	});

	async function loadData(id: number) {
		loading = true;
		try {
			const [a, cats, t] = await Promise.all([
				articles.getById(id),
				categories.getAll(),
				tags.getAll()
			]);
			article = a;
			categoryList = cats;
			tagList = t;

			title = a.title;
			slug = a.slug;
			content = a.content;
			categoryId = a.category_id;
			selectedTagIds = a.tags?.map((t) => t.id) || [];
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function handleSubmit() {
		if (!article) return;
		try {
			await articles.update(article.id, {
				title,
				slug,
				content,
				status: article.status,
				category_id: categoryId,
				tag_ids: selectedTagIds
			});
			goto('/articles');
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed to update');
		}
	}

	async function handleToggleStatus() {
		if (!article) return;
		try {
			article = await articles.toggleStatus(article.id);
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Status toggle failed');
		}
	}
</script>

<div class="header">
	<h1>記事編集</h1>
	{#if article}
		<button
			class={article.status === 'draft' ? 'btn-success' : 'btn-secondary'}
			onclick={handleToggleStatus}
		>
			{article.status === 'draft' ? '公開' : '下書きに戻す'}
		</button>
	{/if}
</div>

{#if loading}
	<p>読み込み中...</p>
{:else if !article}
	<p>記事が見つかりません</p>
{:else}
	<div class="card">
		<ArticleEditor
			bind:title
			bind:slug
			bind:content
			bind:categoryId
			bind:selectedTagIds
			categories={categoryList}
			tags={tagList}
			onSubmit={handleSubmit}
			submitLabel="更新"
		/>
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

	.btn-success {
		background-color: var(--success);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.btn-secondary {
		background-color: var(--secondary);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
</style>

