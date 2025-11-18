import { chromium } from 'playwright';

(async () => {
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	// Affiche les logs du navigateur dans le terminal pour le debug
	page.on('console', msg =>
		console.log(`[BROWSER] ${msg.type()}:`, msg.text()),
	);

	// 1️⃣ Ouvre la page d’accueil
	page.setDefaultTimeout(60000);
	page.setDefaultNavigationTimeout(90000);
	try {
		await page.goto('https://www.maxance.com/page_403', {
			waitUntil: 'load',
			timeout: 90000,
		});
	} catch (_) {
		// Si "load" échoue, tente un fallback plus souple
		await page.goto('https://www.maxance.com/page_403', {
			waitUntil: 'domcontentloaded',
			timeout: 90000,
		});
	}

	// 🔓 Accepte les cookies si la bannière est présente (page ou iframe)
	try {
		const clickAccept = async scope => {
			const candidates = [
				/Accepter\s*et\s*fermer/i,
				/Tout\s*accepter/i,
				/Accepter/i,
				/Accept(?!er).*close/i,
			];
			for (const re of candidates) {
				const btn = scope.getByRole('button', { name: re });
				if (await btn.count()) {
					await btn.first().click({ timeout: 2000 });
					return true;
				}
			}
			return false;
		};

		// Essaye sur la page principale
		let accepted = await clickAccept(page);

		// Sinon, tente dans les iframes éventuelles
		if (!accepted) {
			for (const frame of page.frames()) {
				if (frame === page.mainFrame()) continue;
				accepted = await clickAccept(frame);
				if (accepted) break;
			}
		}

		if (accepted) {
			await page.waitForTimeout(400);
		}
	} catch (_) {
		// Ignore si non présent
	}

	// 2️⃣ Clique sur le bouton “2 roues”
	await page.getByRole('button', { name: /2 roues/i }).click();

	// 3️⃣ Clique sur “Obtenir un tarif express”
	await page.getByRole('link', { name: /Obtenir\s+un tarif express/i }).click();

	// 4️⃣ Attend le chargement complet
	await page.waitForLoadState('networkidle');
	console.log('✅ Page du tarif express chargée');

	// 5️⃣ Injecte et exécute ton code
	await page.waitForSelector('select', { timeout: 20000 });
	const initStatus = await page.evaluate(async () => {
		try {
			const wait = ms => new Promise(r => setTimeout(r, ms));
			const marqueSelect = document.querySelectorAll('select')[0];
			if (!marqueSelect) throw new Error('Select marque introuvable');

			if (!marqueSelect.value) {
				marqueSelect.value = marqueSelect.querySelectorAll('option')[1]?.value;
				if (!marqueSelect.value) throw new Error('Aucune option de marque');
				marqueSelect.dispatchEvent(new Event('change', { bubbles: true }));
				console.log('⏳ Initialisation... (chargement AJAX)');
				await wait(3000);
			}

			console.log(
				'✅ Page prête, tu peux lancer ton script principal maintenant !',
			);
			return { ok: true };
		} catch (e) {
			console.error('Erreur init:', e.message);
			return { ok: false, error: e.message };
		}
	});
	if (!initStatus?.ok) {
		console.error('Init a échoué:', initStatus?.error);
	}

	// 6️⃣ Lance le script principal dans la page
	const crawlStart = await page.evaluate(async () => {
		const wait = ms => new Promise(r => setTimeout(r, ms));
		const formId = 'amae_checkout_progress_product_moto_motofq10_form';

		const getFormBuildId = () =>
			document.querySelector('input[value^="form-"]')?.value;

		const progress = JSON.parse(
			localStorage.getItem('moto_crawl') || '{"current":0,"results":[]}',
		);
		const results = progress.results || [];

		const marqueSelect = document.querySelectorAll('select')[0];
		const marques = Array.from(marqueSelect.querySelectorAll('option'))
			.filter(
				o =>
					o.value &&
					o.value !== '0' &&
					o.textContent.trim() !== 'Veuillez choisir',
			)
			.map(o => ({ value: o.value, label: o.textContent.trim() }));

		console.log(
			`▶️ Reprise à la marque ${progress.current + 1}/${marques.length}`,
		);

		for (let i = progress.current; i < marques.length; i++) {
			const marque = marques[i];
			console.log(`\n🚀 Marque: ${marque.label}`);
			const marqueData = { marque: marque.label, cylindrees: [] };

			const formBuildId = getFormBuildId();
			if (!formBuildId) {
				console.warn('⚠️ form_build_id manquant — reload');
				progress.current = i;
				progress.results = results;
				localStorage.setItem('moto_crawl', JSON.stringify(progress));
				location.reload();
				return;
			}

			const cylBody = new URLSearchParams({
				form_build_id: formBuildId,
				form_id: formId,
				moto_marque: marque.value,
				_triggering_element_name: 'moto_marque',
			});

			let cylData;
			try {
				const cylRes = await fetch('/system/ajax', {
					method: 'POST',
					headers: {
						'X-Requested-With': 'XMLHttpRequest',
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					},
					body: cylBody,
				});
				cylData = await cylRes.json();
			} catch (e) {
				console.error(`❌ Erreur AJAX cylindrées ${marque.label}:`, e.message);
				continue;
			}

			const cylInsert = cylData.find(
				cmd =>
					cmd.selector?.includes('cylindree') ||
					cmd.selector?.includes('cylinder'),
			);
			if (!cylInsert) {
				console.warn(`❌ Aucune cylindrée pour ${marque.label}`);
				continue;
			}

			const cylHTML = new DOMParser().parseFromString(
				cylInsert.data,
				'text/html',
			);
			const cylindrees = Array.from(cylHTML.querySelectorAll('option'))
				.filter(o => o.value && o.value.trim() !== '')
				.map(o => o.value);

			console.log(`  ⚙️ ${cylindrees.length} cylindrées trouvées`);

			for (const cyl of cylindrees) {
				console.log(`  🛠️ Cylindrée ${cyl}...`);

				const freshId = getFormBuildId();
				if (!freshId) {
					console.warn('⚠️ Token expiré — reload');
					progress.current = i;
					progress.results = results;
					localStorage.setItem('moto_crawl', JSON.stringify(progress));
					location.reload();
					return;
				}

				const body = new URLSearchParams({
					form_build_id: freshId,
					form_id: formId,
					moto_marque: marque.value,
					moto_cylindree: cyl,
					moto_mec: '',
					moto_modele: '',
					_triggering_element_name: 'moto_cylindree',
				});

				try {
					const res = await fetch('/system/ajax', {
						method: 'POST',
						headers: {
							'X-Requested-With': 'XMLHttpRequest',
							'Content-Type':
								'application/x-www-form-urlencoded; charset=UTF-8',
						},
						body,
					});

					const data = await res.json();
					const insert = data.find(
						cmd =>
							cmd.selector?.includes('modele') ||
							cmd.selector?.includes('model'),
					);

					if (!insert) continue;

					const html = new DOMParser().parseFromString(
						insert.data,
						'text/html',
					);
					const models = Array.from(html.querySelectorAll('option'))
						.filter(o => o.value && o.value !== '')
						.map(o => o.textContent.trim());

					marqueData.cylindrees.push({ cylindree: cyl, modeles: models });
					console.log(`    ✅ ${models.length} modèles`);
				} catch (err) {
					console.warn(
						`    ⚠️ Erreur pour ${marque.label} / ${cyl}: ${err.message}`,
					);
				}

				await wait(700);
			}

			results.push(marqueData);
			progress.current = i + 1;
			progress.results = results;
			localStorage.setItem('moto_crawl', JSON.stringify(progress));

			console.log(`📦 Terminé pour ${marque.label}`);
			await wait(1200);
		}

		console.log('✅ Crawl terminé !');
		try {
			copy(results);
		} catch (_) {}
		return { started: true };
	});
	if (!crawlStart?.started) {
		console.error("Le script principal ne s'est pas lancé correctement");
	}

	console.log('✅ Script terminé dans le navigateur !');
	// await browser.close(); // facultatif si tu veux le garder ouvert
})();
