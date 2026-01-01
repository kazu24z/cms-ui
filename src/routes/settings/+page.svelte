<script lang="ts">
	import { onMount } from 'svelte';
	import { exportSite, settings } from '$lib/api';

	let exportDir = $state('');
	let exporting = $state(false);
	let saving = $state(false);
	let message = $state('');
	let loading = $state(true);

	onMount(async () => {
		try {
			const s = await settings.get();
			exportDir = s.export_dir;
		} catch (e) {
			message = `設定の読み込みに失敗: ${e instanceof Error ? e.message : 'Failed'}`;
		} finally {
			loading = false;
		}
	});

	async function handleSave() {
		if (!exportDir) return;
		saving = true;
		message = '';
		try {
			await settings.update({ export_dir: exportDir });
			message = '設定を保存しました';
		} catch (e) {
			message = `エラー: ${e instanceof Error ? e.message : 'Failed'}`;
		} finally {
			saving = false;
		}
	}

	async function handleExport() {
		exporting = true;
		message = '';
		try {
			const result = await exportSite.run();
			message = `エクスポート完了: ${result.export_dir}`;
		} catch (e) {
			message = `エラー: ${e instanceof Error ? e.message : 'Failed'}`;
		} finally {
			exporting = false;
		}
	}
</script>

<h1>設定</h1>

{#if loading}
	<p>読み込み中...</p>
{:else}
	<div class="card">
		<h2>エクスポート</h2>
		<p class="description">公開済みの記事を静的 HTML として出力します。</p>

		<div class="form-row">
			<label>
				出力先ディレクトリ
				<input type="text" bind:value={exportDir} placeholder="/path/to/output" />
			</label>
		</div>

		<div class="button-row">
			<button type="button" class="btn-secondary" onclick={handleSave} disabled={saving}>
				{saving ? '保存中...' : '設定を保存'}
			</button>
			<button type="button" class="btn-primary" onclick={handleExport} disabled={exporting}>
				{exporting ? 'エクスポート中...' : 'エクスポート実行'}
			</button>
		</div>

		{#if message}
			<p class="message" class:error={message.startsWith('エラー')}>{message}</p>
		{/if}
	</div>
{/if}

<style>
	.description {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.form-row {
		margin-bottom: 1rem;
	}

	.form-row label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.form-row input {
		max-width: 400px;
	}

	.button-row {
		display: flex;
		gap: 0.75rem;
	}

	.btn-secondary {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s;
	}

	.btn-secondary:hover {
		background: var(--bg-secondary);
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 4px;
		color: var(--success);
	}

	.message.error {
		color: var(--danger);
	}
</style>
