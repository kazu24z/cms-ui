<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<div class="app">
	<nav class="sidebar">
		<div class="logo">
			<h1>CMS</h1>
		</div>
		<ul class="nav-links">
			<li><a href="/">ダッシュボード</a></li>
			<li><a href="/articles">記事</a></li>
			<li><a href="/categories">カテゴリ</a></li>
			<li><a href="/tags">タグ</a></li>
			<li><a href="/settings">設定</a></li>
		</ul>
	</nav>
	<main class="content">
		{@render children()}
	</main>
</div>
