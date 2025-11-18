import { HabitationForm } from '../components/HabitationForm';

export function Home() {
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
							Mentonnaise d'assurances - Devis assurance habitation
						</h1>
						<p className="text-sm text-gray-600">
							Renseignez les informations ci-dessous pour recevoir votre devis.
						</p>
					</div>
				</div>
				<div className="mt-8 rounded border bg-white p-6 animate-fade-in">
					<HabitationForm />
				</div>
			</div>
		</div>
	);
}
