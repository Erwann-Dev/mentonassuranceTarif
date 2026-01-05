import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendEmailQuote } from '../lib/api';
import {
	computeClaimsRecencyMonths,
	computePermitSeniorityMonths,
	computeVehicleAgeYears,
} from '../lib/derived';
import type {
	EmailQuoteRequest,
	ClaimItem,
} from '../../../../packages/types/src';

interface Props {
	vehicle: {
		make?: string;
		model?: string;
		cc?: number;
		firstRegistrationDate?: string;
	};
	identity: {
		garagePostalCode?: string;
		lastName?: string;
		phone?: string;
		birthDate?: string;
		bonusMalus?: number;
	};
	declarations: {
		convictions3y?: boolean;
		convictionDate?: string;
		insurerCancellation3y?: boolean;
		insurerCancellationDate?: string;
		insurerCancellationReason?: 'NON_PAYMENT' | 'RISK_AGGRAVATION' | 'CLAIMS_FREQUENCY' | 'OTHER';
		licenseSuspension5y?: boolean;
		licenseSuspensionDate?: string;
		licenseSuspensionReason?: 'DRUG' | 'ALCOHOL' | 'SPEEDING' | 'OTHER';
	};
	driver: {
		permitType?: 'AM' | 'A1' | 'A2' | 'A' | 'B';
		permitDate?: string;
		insuredMonthsLast48?: number;
		claimsCount?: number;
		claims?: { type?: string; lossDate?: string }[];
	};
}

export function StepEmail({ vehicle, identity, declarations, driver }: Props) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<string | null>(null);
	const { t } = useTranslation();

	// Load saved email once
	useEffect(() => {
		try {
			const raw = localStorage.getItem('email-step');
			if (raw) setEmail(JSON.parse(raw));
		} catch {}
	}, []);

	// Persist email when it changes
	useEffect(() => {
		try {
			localStorage.setItem('email-step', JSON.stringify(email));
		} catch {}
	}, [email]);

	async function onSubmit() {
		setStatus('sending');
		const quoteId = crypto.randomUUID();

		const claims: ClaimItem[] = (driver.claims ?? [])
			.filter(c => c.type && c.lossDate)
			.map(c => ({ type: c.type as ClaimItem['type'], lossDate: c.lossDate! }));

		const payload: EmailQuoteRequest = {
			quoteId,
			locale: 'fr-FR',
			vehicle: {
				make: vehicle.make!,
				model: vehicle.model!,
				cc: vehicle.cc!,
				firstRegistrationDate: vehicle.firstRegistrationDate!,
			},
			identity: {
				garagePostalCode: identity.garagePostalCode!,
				lastName: identity.lastName!,
				phone: identity.phone!,
				email,
				birthDate: identity.birthDate!,
				bonusMalus: identity.bonusMalus ?? 1,
			},
			driver: {
				permitType: driver.permitType!,
				permitDate: driver.permitDate!,
				insuredMonthsLast48: driver.insuredMonthsLast48 ?? 0,
			},
			declarations: {
				convictions3y: !!declarations.convictions3y,
				convictionDate: declarations.convictionDate,
				insurerCancellation3y: !!declarations.insurerCancellation3y,
				insurerCancellationDate: declarations.insurerCancellationDate,
				insurerCancellationReason: declarations.insurerCancellationReason,
				licenseSuspension5y: !!declarations.licenseSuspension5y,
				licenseSuspensionDate: declarations.licenseSuspensionDate,
				licenseSuspensionReason: declarations.licenseSuspensionReason,
			},
			claims,
			derived: {
				permitSeniorityMonths: computePermitSeniorityMonths(driver.permitDate),
				vehicleAgeYears: computeVehicleAgeYears(vehicle.firstRegistrationDate),
				claimsRecencyMonths: computeClaimsRecencyMonths(
					claims.map(c => c.lossDate),
				),
			},
			consents: { privacy: true, marketing: false },
		};

		const res = await sendEmailQuote(payload);
		setStatus(res.status);
	}

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-1">Email *</label>
				<input
					type="email"
					className="w-full rounded border p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
					placeholder="ex: jean.dupont@example.com"
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
			</div>

			{/* Info bloc: ce qui se passe après l'envoi + pièces à prévoir */}
			<div className="rounded-md border border-amber-300 bg-amber-50 p-4">
				<div className="mb-1 text-sm font-semibold text-amber-900">
					{t('email.info.title')}
				</div>
				<p className="text-sm text-amber-900">{t('email.info.lead')}</p>
				<p className="mt-3 text-sm text-amber-900">{t('email.info.sub')}</p>
				<ul className="mt-2 list-disc pl-5 text-sm text-amber-900 space-y-1">
					<li>{t('email.info.items.permit')}</li>
					<li>{t('email.info.items.id')}</li>
					<li>{t('email.info.items.carte_grise')}</li>
					<li>{t('email.info.items.releve')}</li>
				</ul>
				<p className="mt-3 text-sm text-amber-900">{t('email.info.advice')}</p>
			</div>
			<button
				type="button"
				className="w-full rounded bg-red-500 p-3 text-white"
				onClick={onSubmit}
				disabled={status === 'sending'}
			>
				{status === 'sending' ? 'Envoi…' : 'Obtenir mon tarif'}
			</button>
			{status === 'EMAIL_SENT' && (
				<div className="rounded border border-green-400 bg-green-50 p-3 text-sm">
					{t('email.sent')}
				</div>
			)}
			{status === 'ERROR' && (
				<div className="rounded border border-red-400 bg-red-50 p-3 text-sm">
					{t('email.error')}
				</div>
			)}
		</div>
	);
}
