import { writable, get } from 'svelte/store';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export const templates: Writable<SavedTemplate[]> = localStorageStore('templates', []);

export const selectedTemplate = writable<number>();

export const data = writable<Data>({
	studentName: '',
	month: new Date().getMonth(),
	price: 0,
	studyIntervals: [2, 4]
});

selectedTemplate.subscribe((idx) => {
	if (idx !== undefined) {
		const template = get(templates)[idx];
		data.set(template);
	}
});

export const table = (() => {
	const { subscribe, set, update } = writable<Table[]>([]);
	const history: Table[][] = [];
	let historyIdx: number;

	return {
		subscribe,
		update,
		set(newData: Table[]) {
			history.push(newData);
			historyIdx = history.length - 1;
			set(newData);
		},
		undo() {
			if (historyIdx > 0) {
				historyIdx--;
				set(history[historyIdx]);
			}
		},
		redo() {
			if (historyIdx < history.length - 1) {
				historyIdx++;
				set(history[historyIdx]);
			}
		}
	};
})();

export const sidebarOpen = writable(true);
