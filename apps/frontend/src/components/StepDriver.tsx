import { useEffect, useMemo } from 'react';
import { frToIso, isoToFr, maskFrDate } from '../lib/dateFormat';
import ReactDatePicker from 'react-datepicker';
import { fr } from 'date-fns/locale';

interface ClaimView {
	type?: string;
	lossDate?: string;
}

interface Props {
	value: {
		permitType?: 'AM' | 'A1' | 'A2' | 'A' | 'B';
		permitDate?: string;
		insuredMonthsLast48?: number;
		claimsCount?: number;
		claims?: ClaimView[];
	};
	onChange: (next: Props['value']) => void;
}

const DatePickerAny = ReactDatePicker as unknown as React.ComponentType<any>;

const CLAIM_TYPES = [
	'MATERIAL_RESPONSIBLE',
	'MATERIAL_NON_RESPONSIBLE',
	'BODILY_RESPONSIBLE',
	'BODILY_NON_RESPONSIBLE',
	'THEFT',
	'FIRE',
	'GLASS',
	'OTHER',
] as const;

const CLAIM_LABELS: Record<(typeof CLAIM_TYPES)[number], string> = {
	MATERIAL_RESPONSIBLE: 'Matériel - Responsable',
	MATERIAL_NON_RESPONSIBLE: 'Matériel - Non responsable',
	BODILY_RESPONSIBLE: 'Corporel - Responsable',
	BODILY_NON_RESPONSIBLE: 'Corporel - Non responsable',
	THEFT: 'Vol',
	FIRE: 'Incendie',
	GLASS: 'Bris de glace',
	OTHER: 'Autres',
};

export function StepDriver({ value, onChange }: Props) {
	// Load once from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem('driver-step');
			if (raw) {
				const saved = JSON.parse(raw);
				const next = { ...value, ...saved } as Props['value'];
				const a = JSON.stringify(value);
				const b = JSON.stringify(next);
				if (a !== b) onChange(next);
			}
		} catch {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Persist when changed
	useEffect(() => {
		try {
			localStorage.setItem('driver-step', JSON.stringify(value));
		} catch {}
	}, [value]);
	const claims = useMemo(() => {
		const n = value.claimsCount ?? 0;
		const base = value.claims ?? [];
		return Array.from({ length: n }, (_, i) => base[i] ?? {});
	}, [value.claims, value.claimsCount]);

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-1">
					Type de permis *
				</label>
				<select
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					value={value.permitType ?? ''}
					onChange={e =>
						onChange({
							...value,
							permitType: (e.target.value as any) || undefined,
						})
					}
				>
					<option value="">Sélectionner…</option>
				<option value="AM">AM</option>
					<option value="A1">A1</option>
					<option value="A2">A2</option>
					<option value="A">A</option>
				<option value="B">B</option>
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Date d’obtention du permis *
				</label>
				<DatePickerAny
					selected={value.permitDate ? new Date(value.permitDate) : null}
					onChange={(date: Date | null) =>
						onChange({ ...value, permitDate: date?.toISOString() ?? undefined })
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

			<div>
				<label className="block text-sm font-medium mb-1">
					Mois assurés (48 derniers mois) *
				</label>
				<select
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					value={value.insuredMonthsLast48 ?? 0}
					onChange={e =>
						onChange({ ...value, insuredMonthsLast48: Number(e.target.value) })
					}
				>
					{Array.from({ length: 49 }, (_, i) => (
						<option key={i} value={i}>
							{i}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Nombre de sinistres (3 ans) *
				</label>
				<select
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					value={value.claimsCount ?? 0}
					onChange={e =>
						onChange({ ...value, claimsCount: Number(e.target.value) })
					}
				>
					{Array.from({ length: 6 }, (_, i) => (
						<option key={i} value={i}>
							{i}
						</option>
					))}
				</select>
			</div>

			{claims.length > 0 && (
				<div className="space-y-4">
					{claims.map((c, i) => (
						<div key={i} className="rounded border p-3">
							<div className="font-medium mb-2">Sinistre #{i + 1}</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Type *</label>
									<select
										className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
										value={c.type ?? ''}
										onChange={e => {
											const next = [...claims];
											next[i] = { ...next[i], type: e.target.value };
											onChange({ ...value, claims: next });
										}}
									>
										<option value="">Sélectionner…</option>
										{CLAIM_TYPES.map(t => (
											<option key={t} value={t}>
												{CLAIM_LABELS[t]}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm mb-1">Date *</label>
									<DatePickerAny
										selected={c.lossDate ? new Date(c.lossDate) : null}
										onChange={(date: Date | null) => {
											const next = [...claims];
											next[i] = { ...next[i], lossDate: date?.toISOString() ?? undefined };
											onChange({ ...value, claims: next });
										}}
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
						</div>
					))}
				</div>
			)}
		</div>
	);
}
