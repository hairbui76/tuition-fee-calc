<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-modern.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { Navigation } from '$lib/components';
	import { sidebarOpen } from '$lib/stores/appStores';
</script>

{#if $sidebarOpen}
	<AppShell slotSidebarLeft="bg-surface-500/5 w-80 p-4">
		<div slot="sidebarLeft">
			<Navigation />
		</div>
		<slot />
	</AppShell>
{:else}
	<AppShell>
		<slot />
	</AppShell>
{/if}
