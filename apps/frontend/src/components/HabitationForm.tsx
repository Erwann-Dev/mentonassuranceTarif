import { FormEvent, useEffect, useRef, useState } from 'react';
import { sendHabitationQuote } from '../lib/api';
import type { HousingType } from '../../../../packages/types/src';

interface HabitationFormState {
	phone: string;
	housingType: HousingType;
	rooms: string;
	floor: string;
	area: string;
	address: string;
	hasDependency: 'yes' | 'no';
	capital: string;
	hasVeranda: 'yes' | 'no';
	hasFireplace: 'yes' | 'no';
	schoolInsurance: 'yes' | 'no';
	childrenCount: string;
	email: string;
}

const initialState: HabitationFormState = {
	phone: '',
	housingType: 'MAISON',
	rooms: '',
	floor: 'RDC',
	area: '',
	address: '',
	hasDependency: 'no',
	capital: '',
	hasVeranda: 'no',
	hasFireplace: 'no',
	schoolInsurance: 'no',
	childrenCount: '',
	email: '',
};

const STORAGE_KEY = 'habitation-form';
const MIN_CAPITAL = 1000;

const HOUSING_TYPES: { label: string; value: HousingType }[] = [
	{ label: 'Maison', value: 'MAISON' },
	{ label: 'Appartement', value: 'APPARTEMENT' },
];

const FLOOR_OPTIONS = ['RDC', ...Array.from({ length: 25 }, (_, idx) => `${idx + 1}`)];

type ErrorState = Partial<Record<keyof HabitationFormState, string>>;

export function HabitationForm() {
	const [form, setForm] = useState<HabitationFormState>(() => {
		if (typeof window === 'undefined') return initialState;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const saved = JSON.parse(raw) as Partial<HabitationFormState>;
				return { ...initialState, ...saved };
			}
		} catch {
			// ignore malformed or unavailable storage
		}
		return initialState;
	});
	const [errors, setErrors] = useState<ErrorState>({});
	const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(
		'idle',
	);
	const [quoteId, setQuoteId] = useState<string | null>(null);
	const skipPersistRef = useRef(false);

	useEffect(() => {
		if (skipPersistRef.current) {
			skipPersistRef.current = false;
			return;
		}
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
		} catch {
			// ignore storage access errors
		}
	}, [form]);

	function updateField<K extends keyof HabitationFormState>(
		field: K,
		value: HabitationFormState[K],
	) {
		setForm(prev => ({ ...prev, [field]: value }));
		setErrors(prev => ({ ...prev, [field]: undefined }));
	}

	function validate(): boolean {
		const nextErrors: ErrorState = {};
		if (!form.phone.trim()) {
			nextErrors.phone = 'Téléphone requis';
		}
		if (!form.rooms || Number(form.rooms) <= 0) {
			nextErrors.rooms = 'Nombre de pièces invalide';
		}
		if (!form.floor) {
			nextErrors.floor = 'Étage requis';
		}
		if (!form.area || Number(form.area) <= 0) {
			nextErrors.area = 'Superficie invalide';
		}
		if (!form.address.trim()) {
			nextErrors.address = 'Adresse requise';
		}
		const capitalValue = Number(form.capital);
		if (!form.capital || Number.isNaN(capitalValue) || capitalValue < MIN_CAPITAL) {
			nextErrors.capital = `Capital minimum ${MIN_CAPITAL.toLocaleString('fr-FR')} €`;
		}
		if (
			form.schoolInsurance === 'yes' &&
			(!form.childrenCount || Number(form.childrenCount) <= 0)
		) {
			nextErrors.childrenCount = 'Nombre d’enfants requis';
		}
		if (!form.email.trim()) {
			nextErrors.email = 'Email requis';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			nextErrors.email = 'Email invalide';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	function clearForm(options?: { keepStatus?: boolean; keepQuote?: boolean }) {
		skipPersistRef.current = true;
		setForm(initialState);
		setErrors({});
		if (!options?.keepStatus) {
			setStatus('idle');
		}
		if (!options?.keepQuote) {
			setQuoteId(null);
		}
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore storage issues
		}
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!validate()) return;

		setStatus('sending');
		const newQuoteId = crypto.randomUUID();

		try {
			const payload = {
				quoteId: newQuoteId,
				locale: 'fr-FR',
				phone: form.phone.trim(),
				housingType: form.housingType,
				rooms: Number(form.rooms),
				floor: form.floor,
				area: Number(form.area),
				address: form.address.trim(),
				hasDependency: form.hasDependency === 'yes',
				capital: Number(form.capital),
				hasVeranda: form.hasVeranda === 'yes',
				hasFireplace: form.hasFireplace === 'yes',
				schoolInsurance: form.schoolInsurance === 'yes',
				childrenCount:
					form.schoolInsurance === 'yes'
						? Number(form.childrenCount)
						: undefined,
				email: form.email.trim(),
			};

			const res = await sendHabitationQuote(payload);
			if (res.status === 'EMAIL_SENT') {
				setStatus('success');
				setQuoteId(res.quoteId);
			} else {
				setStatus('error');
				setQuoteId(null);
			}
		} catch (err) {
			console.error('Habitation quote failed', err);
			setStatus('error');
			setQuoteId(null);
		}
	}

	function handleClear() {
		clearForm();
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="flex justify-end">
				<button
					type="button"
					onClick={handleClear}
					className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-800"
				>
					Effacer le formulaire
				</button>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label className="block text-sm font-medium mb-1">
						Téléphone portable *
					</label>
					<input
						type="tel"
						className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
						value={form.phone}
						onChange={e => updateField('phone', e.target.value)}
						placeholder="06 12 34 56 78"
					/>
					{errors.phone && (
						<p className="mt-1 text-sm text-red-600">{errors.phone}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Type de logement *
					</label>
					<select
						className="w-full rounded border p-2 bg-white"
						value={form.housingType}
						onChange={e =>
							updateField('housingType', e.target.value as HousingType)
						}
					>
						{HOUSING_TYPES.map(type => (
							<option key={type.value} value={type.value}>
								{type.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Nombre de pièces *
					</label>
					<input
						type="number"
						min={1}
						className="w-full rounded border p-2"
						value={form.rooms}
						onChange={e => updateField('rooms', e.target.value)}
					/>
					{errors.rooms && (
						<p className="mt-1 text-sm text-red-600">{errors.rooms}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Étage (RDC à 25) *
					</label>
					<select
						className="w-full rounded border p-2 bg-white"
						value={form.floor}
						onChange={e => updateField('floor', e.target.value)}
					>
						{FLOOR_OPTIONS.map(option => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{errors.floor && (
						<p className="mt-1 text-sm text-red-600">{errors.floor}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Superficie totale (m²) *
					</label>
					<input
						type="number"
						min={1}
						className="w-full rounded border p-2"
						value={form.area}
						onChange={e => updateField('area', e.target.value)}
					/>
					{errors.area && (
						<p className="mt-1 text-sm text-red-600">{errors.area}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Capital mobilier souhaité *
					</label>
					<input
						type="number"
						min={MIN_CAPITAL}
						step="any"
						className="w-full rounded border p-2"
						value={form.capital}
						onChange={e => updateField('capital', e.target.value)}
					/>
					<p className="mt-1 text-xs text-gray-500">
						Minimum {MIN_CAPITAL.toLocaleString('fr-FR')} € (pas de plafond)
					</p>
					{errors.capital && (
						<p className="mt-1 text-sm text-red-600">{errors.capital}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Dépendance ou garage *
					</label>
					<select
						className="w-full rounded border p-2 bg-white"
						value={form.hasDependency}
						onChange={e =>
							updateField('hasDependency', e.target.value as 'yes' | 'no')
						}
					>
						<option value="yes">Oui</option>
						<option value="no">Non</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Véranda *
					</label>
					<select
						className="w-full rounded border p-2 bg-white"
						value={form.hasVeranda}
						onChange={e =>
							updateField('hasVeranda', e.target.value as 'yes' | 'no')
						}
					>
						<option value="yes">Oui</option>
						<option value="no">Non</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Cheminée, insert ou poêle *
					</label>
					<select
						className="w-full rounded border p-2 bg-white"
						value={form.hasFireplace}
						onChange={e =>
							updateField('hasFireplace', e.target.value as 'yes' | 'no')
						}
					>
						<option value="yes">Oui</option>
						<option value="no">Non</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Assurance scolaire *
					</label>
					<select
						className="w-full rounded border p-2 bg-white"
						value={form.schoolInsurance}
						onChange={e =>
							updateField('schoolInsurance', e.target.value as 'yes' | 'no')
						}
					>
						<option value="yes">Oui</option>
						<option value="no">Non</option>
					</select>
				</div>

				{form.schoolInsurance === 'yes' && (
					<div>
						<label className="block text-sm font-medium mb-1">
							Nombre d’enfants concernés *
						</label>
						<input
							type="number"
							min={1}
							className="w-full rounded border p-2"
							value={form.childrenCount}
							onChange={e => updateField('childrenCount', e.target.value)}
						/>
						{errors.childrenCount && (
							<p className="mt-1 text-sm text-red-600">
								{errors.childrenCount}
							</p>
						)}
					</div>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Adresse complète *
				</label>
				<textarea
					className="w-full rounded border p-2"
					rows={3}
					value={form.address}
					onChange={e => updateField('address', e.target.value)}
				/>
				{errors.address && (
					<p className="mt-1 text-sm text-red-600">{errors.address}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Adresse e-mail *
				</label>
				<input
					type="email"
					className="w-full rounded border p-2"
					placeholder="client@example.com"
					value={form.email}
					onChange={e => updateField('email', e.target.value)}
				/>
				{errors.email && (
					<p className="mt-1 text-sm text-red-600">{errors.email}</p>
				)}
			</div>

			<button
				type="submit"
				className="w-full rounded bg-gray-900 p-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
				disabled={status === 'sending'}
			>
				{status === 'sending'
					? 'Envoi en cours…'
					: 'Envoyer ma demande de devis'}
			</button>

			{status === 'success' && quoteId && (
				<div className="rounded border border-green-400 bg-green-50 p-3 text-sm text-green-800">
					Demande envoyée ! Référence {quoteId}. Nous vous recontactons très
					rapidement.
				</div>
			)}
			{status === 'error' && (
				<div className="rounded border border-red-400 bg-red-50 p-3 text-sm text-red-700">
					Une erreur est survenue. Merci de réessayer ou de nous contacter.
				</div>
			)}
		</form>
	);
}
