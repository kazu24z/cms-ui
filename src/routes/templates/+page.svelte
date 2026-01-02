<script lang="ts">
	import { onMount } from 'svelte';
	import { templates, type Template } from '$lib/api';

	let templateList: Template[] = $state([]);
	let loading = $state(true);
	let message = $state('');
	let isError = $state(false);

	// ファイル入力の参照
	let zipInput: HTMLInputElement;
	let fileInputs: Record<string, HTMLInputElement> = {};

	const templateNames = ['base', 'article', 'index', 'category', 'tag'];
	const templateDescriptions: Record<string, string> = {
		base: 'HTML全体の骨格（head, header, footer）',
		article: '記事個別ページの中身',
		index: 'トップページ（記事一覧）',
		category: 'カテゴリ別一覧',
		tag: 'タグ別一覧'
	};

	onMount(async () => {
		await loadTemplates();
	});

	async function loadTemplates() {
		loading = true;
		try {
			templateList = await templates.getAll();
		} catch (e) {
			showMessage(`読み込み失敗: ${e instanceof Error ? e.message : 'Failed'}`, true);
		} finally {
			loading = false;
		}
	}

	function showMessage(msg: string, error = false) {
		message = msg;
		isError = error;
		setTimeout(() => {
			message = '';
		}, 5000);
	}

	function getTemplate(name: string): Template | undefined {
		return templateList.find((t) => t.name === name);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('ja-JP');
	}

	// 個別ファイルアップロード
	async function handleFileUpload(name: string) {
		const input = fileInputs[name];
		const file = input?.files?.[0];
		if (!file) return;

		try {
			await templates.upload(name, file);
			showMessage(`${name}.html をアップロードしました`);
			await loadTemplates();
		} catch (e) {
			showMessage(`アップロード失敗: ${e instanceof Error ? e.message : 'Failed'}`, true);
		}
		input.value = '';
	}

	// ZIP一括インポート
	async function handleZipImport() {
		const file = zipInput?.files?.[0];
		if (!file) return;

		try {
			const result = await templates.import(file);
			if (result.errors?.length > 0) {
				showMessage(`${result.imported.length}件インポート（エラー: ${result.errors.join(', ')}）`, true);
			} else {
				showMessage(`${result.imported.length}件のテンプレートをインポートしました`);
			}
			await loadTemplates();
		} catch (e) {
			showMessage(`インポート失敗: ${e instanceof Error ? e.message : 'Failed'}`, true);
		}
		zipInput.value = '';
	}

	// デフォルトにリセット
	async function handleReset() {
		if (!confirm('全てのテンプレートをデフォルトに戻しますか？')) return;

		try {
			await templates.reset();
			showMessage('テンプレートをデフォルトに戻しました');
			await loadTemplates();
		} catch (e) {
			showMessage(`リセット失敗: ${e instanceof Error ? e.message : 'Failed'}`, true);
		}
	}
</script>

<h1>テンプレート</h1>

{#if message}
	<div class="message" class:error={isError}>{message}</div>
{/if}

{#if loading}
	<p>読み込み中...</p>
{:else}
	<!-- ZIP一括インポート -->
	<div class="card import-section">
		<h2>一括インポート</h2>
		<p class="description">
			5つのテンプレートファイル（base.html, article.html, index.html, category.html, tag.html）を
			ZIPにまとめてアップロードできます。
		</p>
		<div class="file-upload">
			<input type="file" accept=".zip" bind:this={zipInput} onchange={handleZipImport} />
			<button type="button" class="btn-primary" onclick={() => zipInput.click()}>
				ZIPファイルを選択
			</button>
		</div>
	</div>

	<!-- 個別テンプレート -->
	<div class="card">
		<h2>個別テンプレート</h2>
		<table>
			<thead>
				<tr>
					<th>名前</th>
					<th>説明</th>
					<th>更新日時</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				{#each templateNames as name}
					{@const tmpl = getTemplate(name)}
					<tr>
						<td class="name">{name}.html</td>
						<td class="desc">{templateDescriptions[name]}</td>
						<td class="date">{tmpl ? formatDate(tmpl.updated_at) : '-'}</td>
						<td class="actions">
							<input
								type="file"
								accept=".html"
								bind:this={fileInputs[name]}
								onchange={() => handleFileUpload(name)}
								style="display: none;"
							/>
							<button
								type="button"
								class="btn-secondary btn-small"
								onclick={() => fileInputs[name].click()}
							>
								ファイル選択
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- リセット -->
	<div class="reset-section">
		<button type="button" class="btn-danger" onclick={handleReset}>
			デフォルトに戻す
		</button>
	</div>
{/if}

<style>
	.message {
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		background: var(--success);
		color: white;
	}

	.message.error {
		background: var(--danger);
	}

	.import-section {
		margin-bottom: 1.5rem;
	}

	.description {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.file-upload {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.file-upload input[type='file'] {
		display: none;
	}

	table {
		margin-top: 1rem;
	}

	.name {
		font-family: monospace;
		font-weight: 500;
	}

	.desc {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.date {
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.actions {
		width: 120px;
	}

	.btn-small {
		padding: 0.35rem 0.75rem;
		font-size: 0.8rem;
	}

	.reset-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}
</style>

