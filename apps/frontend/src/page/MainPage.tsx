import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BtnMainPage } from '../components/BtnMainPage';

type ProductCard = {
	route: string;
	accent: string;
	icon: ReactNode;
	translationKey: 'moto' | 'car' | 'home';
	disabledMessageKey?: string;
};

const products: ProductCard[] = [
	{
		route: '/moto',
		accent: 'from-sky-500 to-blue-600',
		icon: <MotoIcon />,
		translationKey: 'moto',
	},
	{
		route: '/home',
		accent: 'from-emerald-500 to-teal-500',
		icon: <HomeIcon />,
		translationKey: 'home',
	},
	{
		route: '/car',
		accent: 'from-indigo-500 to-violet-500',
		icon: <CarIcon />,
		translationKey: 'car',
		disabledMessageKey: 'mainPage.cards.car.comingSoon',
	},
];

export function MainPage() {
	const { t } = useTranslation();
	const [comingSoon, setComingSoon] = useState<{
		title: string;
		message: string;
	} | null>(null);

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#eef4ff] text-slate-900">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" />
				<div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-200 opacity-60 blur-3xl" />
				<div className="absolute bottom-[-80px] left-[-40px] h-80 w-80 rounded-full bg-indigo-200 opacity-50 blur-3xl" />
				<div className="absolute inset-x-0 top-1/3 mx-auto h-64 max-w-5xl rounded-[40px] bg-white/40 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-6xl px-6 py-16">
				<img
					src="/logo_mentonnaise_assurances.png"
					alt={t('mainPage.logoAlt')}
					className="h-32 w-auto drop-shadow-sm mx-auto block mb-10"
				/>
				<p className="mx-auto w-fit rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 shadow-sm">
					{t('mainPage.eyebrow')}
				</p>
				<h1 className="mt-6 text-center text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
					{t('mainPage.title')}
				</h1>
				<p className="mx-auto mt-4 max-w-3xl text-center text-base text-slate-600 sm:text-lg">
					{t('mainPage.description')}
				</p>

				<div className="mt-14">
					<section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
						{products.map((product) => (
							<BtnMainPage
								key={product.route}
								route={product.route}
								title={t(`mainPage.cards.${product.translationKey}.title`)}
								description={t(
									`mainPage.cards.${product.translationKey}.description`,
								)}
								cta={t(`mainPage.${product.translationKey}cta`)}
								accent={product.accent}
								icon={product.icon}
								disabledMessage={
									product.disabledMessageKey
										? t(product.disabledMessageKey)
										: undefined
								}
								onDisabledClick={
									product.disabledMessageKey
										? () =>
												setComingSoon({
													title: t(
														`mainPage.cards.${product.translationKey}.title`,
													),
													message: t(product.disabledMessageKey!),
												})
										: undefined
								}
							/>
						))}
					</section>
				</div>
			</div>

			{comingSoon ? (
				<ComingSoonDialog
					title={comingSoon.title}
					message={comingSoon.message}
					onClose={() => setComingSoon(null)}
				/>
			) : null}
		</div>
	);
}

type ComingSoonDialogProps = {
	title: string;
	message: string;
	onClose: () => void;
};

function ComingSoonDialog({ title, message, onClose }: ComingSoonDialogProps) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center px-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="coming-soon-title"
		>
			<div
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/60 bg-white/95 p-8 text-center shadow-2xl">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8"
						aria-hidden
					>
						<path
							d="M12 6v6m0 4v.01"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M12 21c4.971 0 9-4.029 9-9s-4.029-9-9-9-9 4.029-9 9 4.029 9 9 9Z"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<h2
					id="coming-soon-title"
					className="mt-6 text-2xl font-semibold text-slate-900"
				>
					{title}
				</h2>
				<p className="mt-4 text-base text-slate-600">{message}</p>
				<button
					type="button"
					onClick={onClose}
					className="mt-8 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
				>
					Compris
				</button>
			</div>
		</div>
	);
}

function MotoIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-6 w-6"
		>
			<path
				d="M4.5 18a3 3 0 1 1 0-6M19.5 18a3 3 0 1 0 0-6M7.5 15h9M7 12l2.8-4.8H14l2-3.2"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14.5 10.5h3l1.5-2.5"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function CarIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-6 w-6"
		>
			<path
				d="M3 15v-4l2-5h14l2 5v4"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3 13h18M9 6l-1.5 7m8.5-7 1.5 7"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function HomeIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-6 w-6"
		>
			<path
				d="M4 11 12 4l8 7"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6 10v9h12v-9"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M10 19v-5h4v5"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
