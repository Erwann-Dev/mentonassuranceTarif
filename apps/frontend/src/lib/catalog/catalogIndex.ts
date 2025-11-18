export interface MotoRecord {
	make: string;
	model: string;
	cc: number;
	years?: number[];
}

export interface CatalogIndexes {
	makes: string[];
	makeToModels: Map<string, string[]>;
	makeModelToCcs: Map<string, number[]>; // key `${make}::${model}`
	makeToCcs: Map<string, number[]>; // key `${make}`
	makeCcToModels: Map<string, string[]>; // key `${make}::${cc}`
}

function keyMM(make: string, model: string) {
	return `${make}::${model}`;
}

export async function loadCatalog(): Promise<MotoRecord[]> {
	// Fetch from public folder; Vite serves public files at the root path
	const res = await fetch('/moto_full.json', { cache: 'no-store' });
	if (!res.ok) throw new Error('Failed to load catalog');
	const raw = (await res.json()) as any[];
	// Transform: { marque, cylindrees:[{ cylindree, modeles: [...] }] }
	const records: MotoRecord[] = [];
	for (const brand of raw) {
		const make = String(brand.marque || '').trim();
		for (const c of brand.cylindrees || []) {
			const cc = Number(String(c.cylindree || '').replace(/[^0-9]/g, ''));
			for (const model of c.modeles || []) {
				records.push({ make, model: String(model).trim(), cc });
			}
		}
	}
	return records;
}

export function buildIndexes(records: MotoRecord[]): CatalogIndexes {
	const makesSet = new Set<string>();
	const makeToModels = new Map<string, Set<string>>();
	const makeModelToCcs = new Map<string, Set<number>>();
	const makeToCcs = new Map<string, Set<number>>();
	const makeCcToModels = new Map<string, Set<string>>();

	for (const r of records) {
		const make = r.make.trim();
		const model = r.model.trim();
		makesSet.add(make);
		if (!makeToModels.has(make)) makeToModels.set(make, new Set());
		makeToModels.get(make)!.add(model);
		const k = keyMM(make, model);
		if (!makeModelToCcs.has(k)) makeModelToCcs.set(k, new Set());
		makeModelToCcs.get(k)!.add(r.cc);

		if (!makeToCcs.has(make)) makeToCcs.set(make, new Set());
		makeToCcs.get(make)!.add(r.cc);

		const k2 = `${make}::${r.cc}`;
		if (!makeCcToModels.has(k2)) makeCcToModels.set(k2, new Set());
		makeCcToModels.get(k2)!.add(model);
	}

	return {
		makes: Array.from(makesSet).sort((a, b) => a.localeCompare(b)),
		makeToModels: new Map(
			Array.from(makeToModels.entries()).map(([m, set]) => [
				m,
				Array.from(set).sort((a, b) => a.localeCompare(b)),
			]),
		),
		makeModelToCcs: new Map(
			Array.from(makeModelToCcs.entries()).map(([k, set]) => [
				k,
				Array.from(set).sort((a, b) => a - b),
			]),
		),
		makeToCcs: new Map(
			Array.from(makeToCcs.entries()).map(([m, set]) => [
				m,
				Array.from(set).sort((a, b) => a - b),
			]),
		),
		makeCcToModels: new Map(
			Array.from(makeCcToModels.entries()).map(([k, set]) => [
				k,
				Array.from(set).sort((a, b) => a.localeCompare(b)),
			]),
		),
	};
}

export function getModels(indexes: CatalogIndexes, make?: string): string[] {
	if (!make) return [];
	return indexes.makeToModels.get(make) ?? [];
}

export function getCcs(
	indexes: CatalogIndexes,
	make?: string,
	model?: string,
): number[] {
	if (!make || !model) return [];
	return indexes.makeModelToCcs.get(keyMM(make, model)) ?? [];
}

export function getCcsForMake(
	indexes: CatalogIndexes,
	make?: string,
): number[] {
	if (!make) return [];
	return indexes.makeToCcs.get(make) ?? [];
}

export function getModelsForMakeCc(
	indexes: CatalogIndexes,
	make?: string,
	cc?: number,
): string[] {
	if (!make || !cc) return [];
	return indexes.makeCcToModels.get(`${make}::${cc}`) ?? [];
}

// Lightweight fuzzy contains search for typeahead
export function fuzzyFilter(options: string[], q: string): string[] {
	const s = q.trim().toLowerCase();
	if (!s) return options;
	return options.filter(o => o.toLowerCase().includes(s));
}
