<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { articles, categories, tags, type Category, type Tag } from '$lib/api';
	import ArticleEditor from '$lib/components/ArticleEditor.svelte';

	let title = $state('');
	let slug = $state('');
	let content = $state('');
	let categoryId: number | null = $state(null);
	let selectedTagIds: number[] = $state([]);

	let categoryList: Category[] = $state([]);
	let tagList: Tag[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			[categoryList, tagList] = await Promise.all([categories.getAll(), tags.getAll()]);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	async function handleSubmit() {
		try {
			await articles.create({
				title,
				slug,
				content,
				author_id: 1, // TODO: 認証実装後に変更
				category_id: categoryId,
				tag_ids: selectedTagIds
			});
			goto('/articles');
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed to create');
		}
	}
</script>

<h1>新規記事作成</h1>

{#if loading}
	<p>読み込み中...</p>
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
			submitLabel="作成"
		/>
	</div>
{/if}

