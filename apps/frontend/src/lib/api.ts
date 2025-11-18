import type {
	EmailQuoteRequest,
	EmailQuoteResponse,
	HabitationQuoteRequest,
	HabitationQuoteResponse,
} from '../../../../packages/types/src';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export async function sendEmailQuote(
	payload: EmailQuoteRequest,
): Promise<EmailQuoteResponse> {
	const res = await fetch(`${API_BASE_URL}/moto/email`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		return { quoteId: payload.quoteId, status: 'ERROR' };
	}
	return (await res.json()) as EmailQuoteResponse;
}

export async function sendHabitationQuote(
	payload: HabitationQuoteRequest,
): Promise<HabitationQuoteResponse> {
	const res = await fetch(`${API_BASE_URL}/habitation/email`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		return { quoteId: payload.quoteId, status: 'ERROR' };
	}

	return (await res.json()) as HabitationQuoteResponse;
}
