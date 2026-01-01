<script lang="ts">
	import { marked } from 'marked';
	import { images, API_BASE_URL, type Category, type Tag } from '$lib/api';

	interface Props {
		title: string;
		slug: string;
		content: string;
		categoryId: number | null;
		selectedTagIds: number[];
		categories: Category[];
		tags: Tag[];
		onSubmit: () => void;
		submitLabel: string;
	}

	let {
		title = $bindable(),
		slug = $bindable(),
		content = $bindable(),
		categoryId = $bindable(),
		selectedTagIds = $bindable(),
		categories,
		tags,
		onSubmit,
		submitLabel
	}: Props = $props();

	function generateSlug() {
		slug = title
			.toLowerCase()
			.replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function toggleTag(tagId: number) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
	}

	function parseMarkdown(md: string): string {
		return marked(md, { breaks: true }) as string;
	}

	let textareaEl: HTMLTextAreaElement;
	let uploading = $state(false);

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		const files = e.dataTransfer?.files;
		if (!files) return;
		await uploadImages(files);
	}

	async function handlePaste(e: ClipboardEvent) {
		const files = e.clipboardData?.files;
		if (!files || files.length === 0) return;
		e.preventDefault();
		await uploadImages(files);
	}

	async function uploadImages(files: FileList) {
		for (const file of files) {
			if (!file.type.startsWith('image/')) continue;
			uploading = true;
			try {
				const result = await images.upload(file);
				insertMarkdownImage(result.url, file.name);
			} catch (err) {
				alert(err instanceof Error ? err.message : 'Upload failed');
			} finally {
				uploading = false;
			}
		}
	}

	function insertMarkdownImage(url: string, alt: string) {
		const textarea = textareaEl;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		// フルURLにしてプレビューでも表示できるようにする
		const fullUrl = url.startsWith('/') ? API_BASE_URL.replace('/api', '') + url : url;
		const imgTag = `<img src="${fullUrl}" width="300" alt="${alt}">`;
		content = content.slice(0, start) + imgTag + content.slice(end);
		// カーソル位置を調整
		setTimeout(() => {
			textarea.selectionStart = textarea.selectionEnd = start + imgTag.length;
			textarea.focus();
		}, 0);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}
</script>

<form onsubmit={(e) => { e.preventDefault(); onSubmit(); }}>
	<div class="form-row">
		<label>
			タイトル
			<input type="text" bind:value={title} required />
		</label>
	</div>

	<div class="form-row">
		<label>
			スラッグ
			<div class="slug-input">
				<input type="text" bind:value={slug} required />
				<button type="button" class="btn-secondary" onclick={generateSlug}>自動生成</button>
			</div>
		</label>
	</div>

	<div class="form-row">
		<label>
			カテゴリ
			<select bind:value={categoryId}>
				<option value={null}>なし</option>
				{#each categories as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="form-row">
		<label>タグ</label>
		<div class="tag-selector">
			{#each tags as tag}
				<button
					type="button"
					class="tag-btn"
					class:selected={selectedTagIds.includes(tag.id)}
					onclick={() => toggleTag(tag.id)}
				>
					{tag.name}
				</button>
			{/each}
		</div>
	</div>

	<div class="editor-container">
		<div class="editor-pane">
			<label>本文（Markdown） {#if uploading}<span class="uploading">アップロード中...</span>{/if}</label>
			<textarea
				bind:this={textareaEl}
				bind:value={content}
				rows="20"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				onpaste={handlePaste}
			></textarea>
		</div>
		<div class="preview-pane">
			<label>プレビュー</label>
			<div class="preview-content">
				{@html parseMarkdown(content)}
			</div>
		</div>
	</div>

	<div class="form-actions">
		<button type="submit" class="btn-primary">{submitLabel}</button>
		<a href="/articles" class="btn btn-secondary">キャンセル</a>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-row {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-row label {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.slug-input {
		display: flex;
		gap: 0.5rem;
	}

	.slug-input input {
		flex: 1;
	}

	.tag-selector {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag-btn {
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 0.85rem;
	}

	.tag-btn.selected {
		background: var(--accent);
		border-color: var(--accent);
		color: white;
	}

	.editor-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1rem;
	}

	.editor-pane,
	.preview-pane {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.editor-pane textarea {
		resize: vertical;
		font-family: monospace;
	}

	.preview-pane label {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.preview-content {
		flex: 1;
		padding: 1rem;
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: 4px;
		overflow-y: auto;
		min-height: 400px;
	}

	.preview-content :global(h1),
	.preview-content :global(h2),
	.preview-content :global(h3) {
		margin: 1rem 0 0.5rem;
	}

	.preview-content :global(code) {
		background: var(--bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
	}

	.preview-content :global(pre) {
		background: var(--bg-secondary);
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
	}

	.preview-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.uploading {
		color: var(--accent);
		font-size: 0.8rem;
		margin-left: 0.5rem;
	}
</style>

