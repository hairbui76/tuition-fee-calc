<script lang="ts">
	import { InputBox } from '@/lib/components';
	import { data as dataStore, table, sidebarOpen, templates } from '$lib/stores/appStores';
	import { Interval, DateTime } from 'luxon';
	import { Modal, modalStore, Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faTrash, faRotateLeft, faRotateRight, faBars } from '@fortawesome/free-solid-svg-icons';
	// @ts-ignore
	import { utils, writeFile } from 'xlsx';
	import { derived } from 'svelte/store';

	const monthsList = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
	const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	function* days(interval: Interval) {
		if (interval.start && interval.end) {
			let day = interval.start.startOf('day');
			while (day < interval.end) {
				if ($dataStore.studyIntervals.includes(day.weekday)) yield day;
				day = day.plus({ days: 1 });
			}
		}
	}

	let now = DateTime.local({ zone: 'Asia/Ho_Chi_Minh' });
	let start = DateTime.local(now.year, $dataStore.month);
	let interval = Interval.fromDateTimes(start, start.plus({ months: 1 }));

	const handleCreateTemplate = () =>
		new Promise<boolean>((resolve) => {
			const modal: ModalSettings = {
				type: 'confirm',
				title: 'Please Confirm',
				body: 'Are you sure you wish to proceed?',
				response: (r: boolean) => {
					resolve(r);
				}
			};
			modalStore.trigger(modal);
		}).then((r: any) => {
			if (r)
				$table = [...days(interval)].map((d) => ({
					date: d.toFormat('dd/MM/yyyy'),
					isPresent: true,
					note: ''
				}));
		});

	const handleCheckPresent = (idx: number) => {
		$table[idx].isPresent = !$table[idx].isPresent;
	};

	const handleNote = (idx: number, note: string) => {
		$table[idx].note = note;
	};

	const handleDelete = (idx: number) => {
		$table = $table.filter((_, i) => i !== idx);
	};

	const fitToColumn = (arrayOfObj: RealData[]) => {
		// get maximum character of each column
		return Object.keys(arrayOfObj[0]).map((k) => ({
			wch: Math.max(
				...arrayOfObj.map((obj) => {
					const v = obj[k as keyof RealData];
					if (typeof v === 'string') return v.length;
					else if (typeof v === 'number') return v.toString().length;
					else return 0;
				}),
				k.length
			)
		}));
	};

	const addCommaToMoney = (money: number) => {
		return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};

	const realData = derived(table, ($table) =>
		$table.map((v, idx) => ({
			STT: idx + 1,
			Ngày: v.date,
			'Trạng thái': v.isPresent ? 'Đủ' : 'Vắng',
			'Ghi chú': v.note
		}))
	);

	const handleExport = () => {
		let ws = utils.json_to_sheet($realData, { origin: 'A3' });
		utils.sheet_add_aoa(ws, [[`Học viên: ${$dataStore.studentName}`]], { origin: 'A1' });
		utils.sheet_add_aoa(
			ws,
			[[`Học phí tháng ${$dataStore.month + 1}/${new Date().getFullYear()}`]],
			{
				origin: 'A2'
			}
		);
		const totalDays = $table.filter((t) => t.isPresent).length;
		const realPrice = $dataStore.price * 1000;
		const totalPrice = addCommaToMoney(realPrice * totalDays);
		utils.sheet_add_aoa(
			ws,
			[[`Tổng: ${addCommaToMoney(realPrice)} * (${totalDays} buổi) = ${totalPrice} (VNĐ)`]],
			{ origin: `A${totalDays + 4}` }
		);
		ws['!cols'] = fitToColumn($realData);
		ws['!merges'] = [
			{
				s: { r: 0, c: 0 },
				e: { r: 0, c: 2 }
			},
			{
				s: { r: 1, c: 0 },
				e: { r: 1, c: 2 }
			},
			{
				s: { r: totalDays + 3, c: 0 },
				e: { r: totalDays + 3, c: 2 }
			}
		];
		let wb = utils.book_new();
		utils.book_append_sheet(wb, ws, 'Sheet1');
		writeFile(wb, 'hoc-phi.xlsx');
	};

	const handleSaveTemplate = () => {
		const modal: ModalSettings = {
			type: 'prompt',
			title: 'Enter name of template',
			body: 'Provide your template name',
			value: $dataStore.studentName,
			valueAttr: { type: 'text', required: true },
			response: (r: string) => {
				if (r) {
					const savedData = {
						name: r,
						studentName: $dataStore.studentName,
						month: $dataStore.month,
						price: $dataStore.price,
						studyIntervals: $dataStore.studyIntervals
					};
					templates.update((t) => [...t, savedData]);
				}
			}
		};
		modalStore.trigger(modal);
	};
</script>

<Modal />
<div class="container mx-auto p-8 flex flex-col gap-2">
	<div class="flex">
		<div>
			<button
				type="button"
				class="btn-icon bg-initial"
				on:click={() => ($sidebarOpen = !$sidebarOpen)}
				><Fa icon={faBars} rotate={$sidebarOpen ? '90' : '0'} /></button
			>
		</div>
		<Accordion>
			<AccordionItem open>
				<p slot="summary">Create template here</p>
				<div slot="content" class="flex flex-col gap-2">
					<div class="flex justify-center items-center gap-2 flex-col">
						<InputBox
							label="Student name:"
							placeholder="Enter student name..."
							bind:value={$dataStore.studentName}
						/>
						<div class="container flex justify-center items-center gap-2">
							<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
								<div class="input-group-shim">Month:</div>
								<select bind:value={$dataStore.month}>
									{#each monthsList as opt, idx}
										<option value={idx}>{opt}</option>
									{/each}
								</select>
							</div>
							<InputBox
								label="Price/lesson (1000VND):"
								placeholder="Enter price..."
								bind:value={$dataStore.price}
							/>
						</div>
					</div>
					<div class="flex gap-5">
						<div class="card p-4 flex flex-col gap-2 w-full">
							<span>Study intervals (days in week)</span>
							<div class="flex gap-2">
								{#each daysList as opt, idx}
									<label class="flex items-center space-x-2">
										<input
											class="checkbox"
											type="checkbox"
											value={idx}
											bind:group={$dataStore.studyIntervals}
										/>
										<p>{opt}</p>
									</label>
								{/each}
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<div class="flex gap-1 justify-between">
								<button type="button" class="btn-icon variant-filled" on:click={() => table.undo()}
									><Fa icon={faRotateLeft} /></button
								>
								<button type="button" class="btn-icon variant-filled" on:click={() => table.redo()}
									><Fa icon={faRotateRight} /></button
								>
								<button type="button" class="btn variant-filled" on:click={handleCreateTemplate}
									>Create table</button
								>
							</div>
							<div class="flex gap-1 justify-between">
								<button type="button" class="btn variant-filled" on:click={handleSaveTemplate}
									>Save as template</button
								>
								<button type="button" class="btn variant-filled" on:click={handleExport}
									>Export</button
								>
							</div>
						</div>
					</div>
				</div>
			</AccordionItem>
		</Accordion>
	</div>

	<div class="table-container">
		<table class="table table-hover">
			<thead>
				<tr>
					<th colspan="5">{`Học phí tháng ${$dataStore.month + 1}/${new Date().getFullYear()}`}</th>
				</tr>
				<tr>
					<th>STT</th>
					<th>Ngày</th>
					<th>Trạng thái</th>
					<th>Ghi chú</th>
					<th>Hành động</th>
				</tr>
			</thead>
			<tbody>
				{#each $realData as d}
					<tr>
						<td>{d['STT']}</td>
						<td>{d['Ngày']}</td>
						<td>
							<label class="flex items-center justify-center space-x-2">
								<input
									class="checkbox"
									type="checkbox"
									value={d['Trạng thái'] === 'Đủ'}
									checked={d['Trạng thái'] === 'Đủ'}
									on:change={() => handleCheckPresent(d['STT'] - 1)}
								/>
								<p>Đủ</p>
							</label>
						</td>
						<td>
							<input
								class="input"
								type="text"
								on:change={(e) => {
									if (e.target instanceof HTMLInputElement) {
										const target = e.target;
										handleNote(d['STT'] - 1, target.value);
									}
								}}
								on:keydown={(e) => {
									if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
										e.preventDefault();
										e.target.blur();
									}
								}}
							/>
						</td>
						<td>
							<button
								type="button"
								class="btn variant-filled-error"
								on:click={() => handleDelete(d['STT'] - 1)}
							>
								<span><Fa icon={faTrash} /></span>
								<span>Delete</span>
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
