import { useEffect, useMemo, useState } from 'react';
import {
	buildIndexes,
	getCcsForMake,
	getModelsForMakeCc,
	loadCatalog,
	type CatalogIndexes,
} from '../lib/catalog/catalogIndex';
import ReactDatePicker from 'react-datepicker';
import { fr } from 'date-fns/locale';

interface Props {
	value: {
		make?: string;
		model?: string;
		cc?: number;
		firstRegistrationDate?: string;
	};
	onChange: (next: Props['value']) => void;
}

export function StepVehicle({ value, onChange }: Props) {
	const [idx, setIdx] = useState<CatalogIndexes | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const data = await loadCatalog();
				setIdx(buildIndexes(data));
			} catch (e) {
				console.error('Failed to load catalog', e);
			}
		})();
	}, []);

	// Load initial values from localStorage once
	useEffect(() => {
		try {
			const raw = localStorage.getItem('vehicle-step');
			if (raw) {
				const saved = JSON.parse(raw);
				const next = { ...value, ...saved };
				if (
					next.make !== value.make ||
					next.model !== value.model ||
					next.cc !== value.cc ||
					next.firstRegistrationDate !== value.firstRegistrationDate
				) {
					onChange(next);
				}
			}
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem('vehicle-step', JSON.stringify(value));
		} catch {}
	}, [value]);

	const makes = idx?.makes ?? [];
	const ccs = useMemo(
		() => (idx ? getCcsForMake(idx, value.make) : []),
		[idx, value.make],
	);
	const models = useMemo(
		() => (idx ? getModelsForMakeCc(idx, value.make, value.cc) : []),
		[idx, value.make, value.cc],
	);

	function isoToDate(iso?: string): Date | null {
		if (!iso) return null;
		const [y, m, d] = iso.split('-').map(Number);
		if (!y || !m || !d) return null;
		return new Date(y, m - 1, d);
	}

	function dateToIso(date: Date | null): string | undefined {
		if (!date) return undefined;
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	const DatePickerAny = ReactDatePicker as unknown as React.ComponentType<any>;

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-1">Marque *</label>
				<select
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					value={value.make ?? ''}
					onChange={e =>
						onChange({
							...value,
							make: e.target.value || undefined,
							model: undefined,
							cc: undefined,
						})
					}
				>
					<option value="">Sélectionner…</option>
					{makes.map(m => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Cylindrée *</label>
				<select
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					disabled={!value.make}
					value={value.cc ?? ''}
					onChange={e =>
						onChange({
							...value,
							cc: e.target.value ? Number(e.target.value) : undefined,
							model: undefined,
						})
					}
				>
					<option value="">Sélectionner…</option>
					{ccs.map(c => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Modèle *</label>
				<select
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					disabled={!value.cc}
					value={value.model ?? ''}
					onChange={e =>
						onChange({ ...value, model: e.target.value || undefined })
					}
				>
					<option value="">Sélectionner…</option>
					{models.map(m => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Date de 1ère mise en circulation *
				</label>
				<DatePickerAny
					selected={isoToDate(value.firstRegistrationDate)}
					onChange={(date: Date | null) =>
						onChange({
							...value,
							firstRegistrationDate: dateToIso(date),
						})
					}
					locale={fr}
					dateFormat="dd/MM/yyyy"
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					showMonthDropdown
					showYearDropdown
					showIcon
					dropdownMode="select"
					placeholderText="jj/mm/aaaa"
				/>
			</div>
		</div>
	);
}
