import { useState } from 'react';
import { StepVehicle } from '../components/StepVehicle';
import { StepIdentity } from '../components/StepIdentity';
import { StepDeclarations } from '../components/StepDeclarations';
import { StepDriver } from '../components/StepDriver';
import { StepEmail } from '../components/StepEmail';

export function Car() {
	const [step, setStep] = useState(1);
	const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
	const [vehicle, setVehicle] = useState<any>({});
	const [identity, setIdentity] = useState<any>({ bonusMalus: 1 });
	const [declarations, setDeclarations] = useState<any>({});
	const [driver, setDriver] = useState<any>({
		insuredMonthsLast48: 0,
		claimsCount: 0,
		claims: [],
	});

	const handleStepChange = (newStep: number) => {
		setDirection(newStep > step ? 'forward' : 'backward');
		setStep(newStep);
	};

	function isStep1Valid() {
		return Boolean(
			vehicle.make &&
				vehicle.cc &&
				vehicle.model &&
				vehicle.firstRegistrationDate,
		);
	}
	function isStep2Valid() {
		const hasDecls =
			typeof declarations.convictions3y === 'boolean' &&
			typeof declarations.insurerCancellation3y === 'boolean' &&
			typeof declarations.licenseSuspension5y === 'boolean';
		return Boolean(
			identity.garagePostalCode?.length === 5 &&
				identity.lastName &&
				identity.phone &&
				Number.isFinite(identity.age) &&
				Number.isFinite(identity.bonusMalus) &&
				hasDecls,
		);
	}
	function isStep3Valid() {
		const baseOk = Boolean(
			driver.permitType && driver.permitDate && driver.insuredMonthsLast48 >= 0,
		);
		const n = Number(driver.claimsCount ?? 0);
		const claims = driver.claims ?? [];
		const claimsOk =
			n === 0 ||
			(claims.length >= n &&
				claims.slice(0, n).every((c: any) => c?.type && c?.lossDate));
		return baseOk && claimsOk;
	}

	const stepNames = [
		'Véhicule',
		'Identité & Déclarations',
		'Conducteur',
		'Email',
	];
	const currentName = stepNames[step - 1];
	const canGoNext =
		step === 1
			? isStep1Valid()
			: step === 2
				? isStep2Valid()
				: step === 3
					? isStep3Valid()
					: false;
	// Box resizes naturally; height is not fixed to avoid cropping

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<div className="mx-auto max-w-3xl p-6">
				<div className="mb-6 flex items-center gap-4">
					<img
						src="/logo_mentonnaise_assurances.png"
						alt="Mentonnaise d'assurances"
						className="h-32 w-auto"
					/>
					<div>
						<h1 className="text-2xl font-semibold mb-1">
							Mentonnaise d'assurances - Devis assurance voiture
						</h1>
						<div className="text-sm text-gray-600 mb-2">
							Étape {step} / 4 — {currentName}
						</div>
						<div className="progress-track w-64">
							<div
								className="progress-fill"
								style={{ width: `${((step - 1) / 3) * 100}%` }}
							/>
						</div>
					</div>
				</div>
				<div className="mt-8 rounded border bg-white p-6 animate-fade-in overflow-hidden">
					<div
						className={
							direction === 'forward' ? 'step-enter-right' : 'step-enter-left'
						}
					>
						{step === 1 && (
							<StepVehicle value={vehicle} onChange={setVehicle} />
						)}
						{step === 2 && (
							<div className="space-y-8">
								<StepIdentity value={identity} onChange={setIdentity} />
								<StepDeclarations
									value={declarations}
									onChange={setDeclarations}
								/>
							</div>
						)}
						{step === 3 && <StepDriver value={driver} onChange={setDriver} />}
						{step === 4 && (
							<StepEmail
								vehicle={vehicle}
								identity={identity}
								declarations={declarations}
								driver={driver}
							/>
						)}
					</div>
					<div className="mt-6 flex justify-between">
						{step > 1 ? (
							<button
								type="button"
								className="rounded border px-4 py-2 transition-colors duration-200 hover:bg-gray-50"
								onClick={() => handleStepChange(Math.max(1, step - 1))}
							>
								Précédent
							</button>
						) : (
							<span />
						)}
						{step < 4 ? (
							<button
								type="button"
								className={`rounded px-4 py-2 transition-colors duration-200 ${
									step === 4 || !canGoNext
										? 'bg-gray-300 text-gray-600 cursor-not-allowed'
										: 'bg-gray-900 text-white hover:bg-gray-800'
								}`}
								disabled={step === 4 || !canGoNext}
								onClick={() => {
									if (step < 4 && canGoNext)
										handleStepChange(Math.min(4, step + 1));
								}}
							>
								Suivant
							</button>
						) : (
							<span />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
