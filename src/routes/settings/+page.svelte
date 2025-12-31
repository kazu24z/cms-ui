<script lang="ts">
	import { exportSite } from '$lib/api';

	let exportDir = $state('/tmp/cms-export');
	let exporting = $state(false);
	let message = $state('');

	async function handleExport() {
		if (!exportDir) return;
		exporting = true;
		message = '';
		try {
			const result = await exportSite.run(exportDir);
			message = `エクスポート完了: ${result.export_dir}`;
		} catch (e) {
			message = `エラー: ${e instanceof Error ? e.message : 'Failed'}`;
		} finally {
			exporting = false;
		}
	}
</script>

<h1>設定</h1>

<div class="card">
	<h2>エクスポート</h2>
	<p class="description">公開済みの記事を静的 HTML として出力します。</p>

	<form onsubmit={(e) => { e.preventDefault(); handleExport(); }}>
		<div class="form-row">
			<label>
				出力先ディレクトリ
				<input type="text" bind:value={exportDir} placeholder="/path/to/output" />
			</label>
		</div>

		<button type="submit" class="btn-primary" disabled={exporting}>
			{exporting ? 'エクスポート中...' : 'エクスポート実行'}
		</button>
	</form>

	{#if message}
		<p class="message" class:error={message.startsWith('エラー')}>{message}</p>
	{/if}
</div>

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

