import { useEffect } from 'react';

interface Props {
	value: {
		convictions3y?: boolean;
		insurerCancellation3y?: boolean;
		licenseSuspension5y?: boolean;
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
			<Toggle
				checked={value.convictions3y}
				onChange={v => onChange({ ...value, convictions3y: v })}
				label={
					"Depuis 3 ans, condamnation (délit de fuite, défaut d'assurance, refus d'obtempérer)?"
				}
			/>
			<Toggle
				checked={value.insurerCancellation3y}
				onChange={v => onChange({ ...value, insurerCancellation3y: v })}
				label={'Depuis 3 ans, résiliation par votre assureur précédent?'}
			/>
			<Toggle
				checked={value.licenseSuspension5y}
				onChange={v => onChange({ ...value, licenseSuspension5y: v })}
				label={'Depuis 5 ans, suspension/annulation du permis de conduire?'}
			/>
			{value.convictions3y && (
				<div className="rounded border border-red-400 bg-red-50 p-3 text-sm">
					Chemin bloqué: ces déclarations entraînent un refus. Merci de nous
					contacter.
				</div>
			)}
		</div>
	);
}
