interface Table {
	date: string;
	isPresent: boolean;
	note: string;
}

interface RealData {
	STT: number;
	Ngày: string;
	'Trạng thái': string;
	'Ghi chú': string;
}

interface Data {
	studentName: string;
	month: number;
	price: number;
	studyIntervals: number[];
}

interface SavedTemplate extends Data {
	name: string;
}
