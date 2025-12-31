<script lang="ts">
	import { onMount } from 'svelte';
	import { categories, type Category } from '$lib/api';

	let categoryList: Category[] = $state([]);
	let loading = $state(true);

	let newName = $state('');
	let newSlug = $state('');

	let editingId: number | null = $state(null);
	let editName = $state('');
	let editSlug = $state('');

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		loading = true;
		try {
			categoryList = await categories.getAll();
		} finally {
			loading = false;
		}
	}

	async function handleCreate() {
		if (!newName || !newSlug) return;
		try {
			await categories.create({ name: newName, slug: newSlug });
			newName = '';
			newSlug = '';
			await loadCategories();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed');
		}
	}

	function startEdit(cat: Category) {
		editingId = cat.id;
		editName = cat.name;
		editSlug = cat.slug;
	}

	function cancelEdit() {
		editingId = null;
	}

	async function handleUpdate() {
		if (!editingId) return;
		try {
			await categories.update(editingId, { name: editName, slug: editSlug });
			editingId = null;
			await loadCategories();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed');
		}
	}

	async function handleDelete(id: number) {
		if (!confirm('削除しますか？')) return;
		try {
			await categories.delete(id);
			await loadCategories();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed');
		}
	}

	function generateSlug() {
		newSlug = newName
			.toLowerCase()
			.replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
			.replace(/^-|-$/g, '');
	}
</script>

<h1>カテゴリ管理</h1>

<div class="card">
	<h2>新規作成</h2>
	<form class="create-form" onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
		<input type="text" placeholder="カテゴリ名" bind:value={newName} />
		<div class="slug-input">
			<input type="text" placeholder="スラッグ" bind:value={newSlug} />
			<button type="button" class="btn-secondary" onclick={generateSlug}>自動</button>
		</div>
		<button type="submit" class="btn-primary">追加</button>
	</form>
</div>

<div class="card" style="margin-top: 1.5rem;">
	<h2>カテゴリ一覧</h2>
	{#if loading}
		<p>読み込み中...</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>名前</th>
					<th>スラッグ</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				{#each categoryList as cat}
					<tr>
						{#if editingId === cat.id}
							<td><input type="text" bind:value={editName} /></td>
							<td><input type="text" bind:value={editSlug} /></td>
							<td class="actions">
								<button class="btn-primary" onclick={handleUpdate}>保存</button>
								<button class="btn-secondary" onclick={cancelEdit}>キャンセル</button>
							</td>
						{:else}
							<td>{cat.name}</td>
							<td>{cat.slug}</td>
							<td class="actions">
								<button class="btn-secondary" onclick={() => startEdit(cat)}>編集</button>
								<button class="btn-danger" onclick={() => handleDelete(cat.id)}>削除</button>
							</td>
						{/if}
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="empty">カテゴリがありません</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.create-form {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.create-form input {
		width: 200px;
	}

	.slug-input {
		display: flex;
		gap: 0.25rem;
	}

	.slug-input input {
		width: 150px;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions button {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	.empty {
		text-align: center;
		color: var(--text-secondary);
	}
</style>

