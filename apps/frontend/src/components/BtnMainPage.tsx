import { Link } from 'react-router-dom';
import { MouseEvent, ReactNode } from 'react';

type BtnMainPageProps = {
	route: string;
	title: string;
	description: string;
	cta: string;
	accent: string;
	icon: ReactNode;
	disabledMessage?: string;
	onDisabledClick?: () => void;
};

export function BtnMainPage({
	route,
	title,
	description,
	cta,
	accent,
	icon,
	disabledMessage,
	onDisabledClick,
}: BtnMainPageProps) {
	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		if (!disabledMessage) return;
		event.preventDefault();
		onDisabledClick?.();
	};

	return (
		<Link
			to={route}
			onClick={handleClick}
			aria-disabled={Boolean(disabledMessage)}
			className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 text-left shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 motion-reduce:transform-none"
		>
			<div>
				<span
					className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${accent}`}
					aria-hidden
				>
					{icon}
				</span>
				<h3 className="mt-6 text-xl font-semibold text-slate-900">{title}</h3>
				<p className="mt-3 text-sm text-slate-600">{description}</p>
			</div>
			<span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
				{cta}
				<svg
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					className="h-4 w-4 transition-transform duration-500 motion-reduce:transform-none group-hover:translate-x-1"
				>
					<path
						fillRule="evenodd"
						d="M4 10a.75.75 0 0 1 .75-.75h8.69L10.22 6.03a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06l3.22-3.22H4.75A.75.75 0 0 1 4 10Z"
						clipRule="evenodd"
					/>
				</svg>
			</span>
		</Link>
	);
}
