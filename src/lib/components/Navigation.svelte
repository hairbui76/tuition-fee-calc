<script lang="ts">
	import { templates, selectedTemplate } from '$lib/stores/appStores';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

	const handleDeleteTemplate = (idx: number) => {
		$templates = $templates.filter((_, i) => i !== idx);
	};
</script>

{#if $templates.length > 0}
	<div class="w-full flex flex-col gap-2">
		<strong>Templates:</strong>
		{#each $templates as template, idx}
			<div class="flex gap-2">
				<a href={`/${encodeURI(template.name)}`} class="flex-1">
					<button
						class="btn variant-filled-surface whitespace-normal break-all w-full"
						on:click={() => selectedTemplate.set(idx)}
					>
						{template.name}
					</button>
				</a>
				<!-- <div class="flex justify-items-center items-center">
					<button class="btn-icon variant-filled-warning shrink-0"
						><Fa icon={faPenToSquare} /></button
					>
				</div> -->
				<div class="flex justify-items-center items-center">
					<button
						class="btn-icon variant-filled-error shrink-0"
						on:click={() => handleDeleteTemplate(idx)}><Fa icon={faTrashCan} /></button
					>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<strong>No templates found</strong>
{/if}
