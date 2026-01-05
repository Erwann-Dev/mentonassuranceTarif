import { useEffect } from 'react';

interface Props {
	value: {
		convictions3y?: boolean;
		convictionDate?: string;
		insurerCancellation3y?: boolean;
		insurerCancellationDate?: string;
		insurerCancellationReason?: 'NON_PAYMENT' | 'RISK_AGGRAVATION' | 'CLAIMS_FREQUENCY' | 'OTHER';
		licenseSuspension5y?: boolean;
		licenseSuspensionDate?: string;
		licenseSuspensionReason?: 'DRUG' | 'ALCOHOL' | 'SPEEDING' | 'OTHER';
	};
	onChange: (next: Props['value']) => void;
}

function Toggle({
	checked,
	onChange,
	label,
}: {
	checked?: boolean;
	onChange: (v: boolean) => void;
	label: string;
}) {
	return (
		<div className="space-y-1">
			<div className="text-sm mb-1">{label} *</div>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					className={`rounded p-2 border ${
						checked ? 'bg-gray-900 text-white' : 'bg-white'
					}`}
					onClick={() => onChange(true)}
				>
					oui
				</button>
				<button
					type="button"
					className={`rounded p-2 border ${
						checked === false ? 'bg-gray-900 text-white' : 'bg-white'
					}`}
					onClick={() => onChange(false)}
				>
					non
				</button>
			</div>
		</div>
	);
}

export function StepDeclarations({ value, onChange }: Props) {
	// Load once from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem('declarations-step');
			if (raw) {
				const saved = JSON.parse(raw);
				const next = { ...value, ...saved };
				const a = JSON.stringify(value);
				const b = JSON.stringify(next);
				if (a !== b) onChange(next);
			}
		} catch {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Persist on change
	useEffect(() => {
		try {
			localStorage.setItem('declarations-step', JSON.stringify(value));
		} catch {}
	}, [value]);
	return (
		<div className="space-y-6">
			<div>
				<Toggle
					checked={value.convictions3y}
					onChange={v => {
						if (v) {
							onChange({ ...value, convictions3y: v });
						} else {
							const { convictionDate, ...rest } = value;
							onChange({ ...rest, convictions3y: v });
						}
					}}
					label={
						"Depuis 3 ans, condamnation (délit de fuite, défaut d'assurance, refus d'obtempérer)?"
					}
				/>
				{value.convictions3y && (
					<div className="mt-3">
						<label className="block text-sm font-medium mb-1">
							Date de la condamnation *
						</label>
						<input
							type="date"
							className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
							value={value.convictionDate ?? ''}
							onChange={e =>
								onChange({
									...value,
									convictionDate: e.target.value || undefined,
								})
							}
						/>
					</div>
				)}
			</div>

			<div>
				<Toggle
					checked={value.insurerCancellation3y}
					onChange={v => {
						if (v) {
							onChange({ ...value, insurerCancellation3y: v });
						} else {
							const { insurerCancellationDate, insurerCancellationReason, ...rest } = value;
							onChange({ ...rest, insurerCancellation3y: v });
						}
					}}
					label={'Depuis 3 ans, résiliation par votre assureur précédent?'}
				/>
				{value.insurerCancellation3y && (
					<div className="mt-3 space-y-3">
						<div>
							<label className="block text-sm font-medium mb-1">
								Date de résiliation *
							</label>
							<input
								type="date"
								className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
								value={value.insurerCancellationDate ?? ''}
								onChange={e =>
									onChange({
										...value,
										insurerCancellationDate: e.target.value || undefined,
									})
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Raison de la résiliation *
							</label>
							<select
								className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
								value={value.insurerCancellationReason ?? ''}
								onChange={e =>
									onChange({
										...value,
										insurerCancellationReason: e.target.value as Props['value']['insurerCancellationReason'] || undefined,
									})
								}
							>
								<option value="">Sélectionner une raison</option>
								<option value="NON_PAYMENT">Non-paiement</option>
								<option value="RISK_AGGRAVATION">Aggravation du risque</option>
								<option value="CLAIMS_FREQUENCY">Fréquence de sinistres</option>
								<option value="OTHER">Autre</option>
							</select>
						</div>
					</div>
				)}
			</div>

			<div>
				<Toggle
					checked={value.licenseSuspension5y}
					onChange={v => {
						if (v) {
							onChange({ ...value, licenseSuspension5y: v });
						} else {
							const { licenseSuspensionDate, licenseSuspensionReason, ...rest } = value;
							onChange({ ...rest, licenseSuspension5y: v });
						}
					}}
					label={'Depuis 5 ans, suspension/annulation du permis de conduire?'}
				/>
				{value.licenseSuspension5y && (
					<div className="mt-3 space-y-3">
						<div>
							<label className="block text-sm font-medium mb-1">
								Date de suspension/annulation *
							</label>
							<input
								type="date"
								className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
								value={value.licenseSuspensionDate ?? ''}
								onChange={e =>
									onChange({
										...value,
										licenseSuspensionDate: e.target.value || undefined,
									})
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Raison de la suspension/annulation *
							</label>
							<select
								className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
								value={value.licenseSuspensionReason ?? ''}
								onChange={e =>
									onChange({
										...value,
										licenseSuspensionReason: e.target.value as Props['value']['licenseSuspensionReason'] || undefined,
									})
								}
							>
								<option value="">Sélectionner une raison</option>
								<option value="DRUG">Stupéfiant</option>
								<option value="ALCOHOL">Alcoolémie</option>
								<option value="SPEEDING">Excès de vitesse</option>
								<option value="OTHER">Autre</option>
							</select>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
