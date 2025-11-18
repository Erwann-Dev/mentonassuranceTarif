import { useEffect } from 'react';

interface Props {
	value: {
		garagePostalCode?: string;
		lastName?: string;
		phone?: string;
		age?: number;
		bonusMalus?: number;
	};
	onChange: (next: Props['value']) => void;
}

export function StepIdentity({ value, onChange }: Props) {
	// Load once from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem('identity-step');
			if (raw) {
				const saved = JSON.parse(raw);
				const next = { ...value, ...saved };
				if (
					next.garagePostalCode !== value.garagePostalCode ||
					next.lastName !== value.lastName ||
					next.phone !== value.phone ||
					next.age !== value.age ||
					next.bonusMalus !== value.bonusMalus
				) {
					onChange(next);
				}
			}
		} catch {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Persist on change
	useEffect(() => {
		try {
			localStorage.setItem('identity-step', JSON.stringify(value));
		} catch {}
	}, [value]);

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-1">
					Code postal du lieu de garage *
				</label>
				{(() => {
					const postal = value.garagePostalCode ?? '';
					const isComplete = postal.length === 5;
					const isValid = /^(?:0[1-9]|[1-8][0-9]|9[0-8])\d{3}$/.test(postal);
					const invalid = isComplete && !isValid;
					return (
						<>
							<input
								className={`w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 ${
									invalid
										? 'border-red-400 focus:ring-red-300'
										: 'focus:ring-gray-300'
								}`}
								inputMode="numeric"
								maxLength={5}
								value={value.garagePostalCode ?? ''}
								onChange={e =>
									onChange({
										...value,
										garagePostalCode: e.target.value
											.replace(/[^0-9]/g, '')
											.slice(0, 5),
									})
								}
								aria-invalid={invalid}
								placeholder="06000"
								title="Code postal français à 5 chiffres"
							/>
							{invalid && (
								<div className="mt-1 text-xs text-red-600">
									Code postal invalide (format FR, 5 chiffres)
								</div>
							)}
						</>
					);
				})()}
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Nom *</label>
				<input
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					value={value.lastName ?? ''}
					onChange={e => onChange({ ...value, lastName: e.target.value })}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Numéro de téléphone *
				</label>
				<input
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					placeholder="+33600000000"
					value={value.phone ?? ''}
					onChange={e => onChange({ ...value, phone: e.target.value })}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1">Âge *</label>
					<input
						type="number"
						className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
						value={value.age ?? ''}
						onChange={e =>
							onChange({
								...value,
								age: e.target.value ? Number(e.target.value) : undefined,
							})
						}
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">
						Bonus-malus *
					</label>
					{(() => {
						const raw = value.bonusMalus;
						const displayValue = raw === undefined || raw === null ? '' : raw;
						const num = raw !== undefined && raw !== null ? Number(raw) : NaN;
						const isValidRange = !isNaN(num) && num >= 0.5 && num <= 3.5;
						// Validation: incréments de 0.01 (0.50, 0.51, ..., 3.49, 3.50)
						const rounded = !isNaN(num) ? Math.round(num * 100) / 100 : NaN;
						const isExact = !isNaN(num) && Math.abs(num - rounded) < 0.001;
						const isValid = isValidRange && isExact;
						const invalid = raw !== undefined && raw !== null && !isValid;

						return (
							<>
								<input
									type="number"
									step="0.01"
									min={0.5}
									max={3.5}
									className={`w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 ${
										invalid
											? 'border-red-400 focus:ring-red-300'
											: 'focus:ring-gray-300'
									}`}
									value={displayValue}
									onChange={e => {
										const val = e.target.value;
										if (val === '') {
											onChange({ ...value, bonusMalus: undefined });
											return;
										}
										const n = Number(val);
										if (!isNaN(n)) {
											// Accepter la valeur telle quelle pendant la saisie (sans arrondir ni clamp)
											// La validation se fera au onBlur
											onChange({ ...value, bonusMalus: n });
										}
									}}
									onBlur={e => {
										const val = e.target.value;
										if (val === '') {
											// Ne pas forcer une valeur par défaut si l'utilisateur laisse vide
											return;
										}
										const n = Number(val);
										if (!isNaN(n)) {
											// Arrondir à l'incrément de 0.01 le plus proche et clamp dans la plage
											const rounded = Math.round(n * 100) / 100;
											const clamped = Math.max(0.5, Math.min(3.5, rounded));
											onChange({ ...value, bonusMalus: clamped });
										}
									}}
								/>
								{invalid && (
									<div className="mt-1 text-xs text-red-600">
										Bonus-malus invalide. Valeurs possibles: 0.50 à 3.50
										(incréments de 0.01)
									</div>
								)}
							</>
						);
					})()}
				</div>
			</div>
		</div>
	);
}
