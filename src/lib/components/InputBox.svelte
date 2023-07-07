<script lang="ts">
	export let label: string;
	export let placeholder = 'Enter something...';
	export let type = 'text';
	export let value: number | string | null = null;

	const typeAction = (node: HTMLInputElement) => {
		node.type = type;
	};
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
	<div class="input-group-shim">{label}</div>
	<input use:typeAction {placeholder} bind:value />
</div>
