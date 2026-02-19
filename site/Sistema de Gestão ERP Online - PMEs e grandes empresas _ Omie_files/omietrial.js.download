$(document).ready(function () {
	const getDeviceTypeTrial = () => {
		const ua = navigator.userAgent;
		if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
			return "tablet";
		}
		if (
			/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
				ua
			)
		) {
			return "mobile";
		}
		return "desktop";
	};
	const getHubSpotUTK = () => {
		const name = "hubspotutk=";
		const decodedCookies = decodeURIComponent(document.cookie);
		const cookiesArray = decodedCookies.split(';');
		for (let i = 0; i < cookiesArray.length; i++) {
			let cookie = cookiesArray[i].trim();
			if (cookie.indexOf(name) === 0) {
				return cookie.substring(name.length, cookie.length);
			}
		}
		return null;
	}
	const submitTrialHub = (formId, eventHash) => {
		const newDeviceTrial = getDeviceTypeTrial();

		const formTrial = document.querySelector('#trial-topo');
		const portalId = '50669433';
		const pageRef = window.location.href;
		const hutk = getHubSpotUTK();

		localStorage.setItem('personNameTrial', formTrial.nickname.value);
		localStorage.setItem('personEmailTrial', formTrial.user_email.value);

		const formData = {
			fields: [
				{
					name: 'firstname',
					value: formTrial.nickname.value
				},
				{
					name: 'email',
					value: formTrial.user_email.value
				},
				{
					name: 'phone',
					value: formTrial.phone.value
				},
				{
					name: '0-2/name',
					value: formTrial.company.value
				},
				{
					name: 'cnpj',
					value: formTrial.company_document.value
				},
				{
					name: 'email_do_seu_contador',
					value: formTrial?.email_contador?.value || ''
				},
				{
					name: 'cargo',
					value: formTrial?.user_jobtitle?.value || ''
				},
				{
					name: 'faturamento',
					value: formTrial.faturamento.value
				},
				{
					name: 'objetivo_do_trial',
					value: formTrial.objetivo_ao_fazer_o_trial.value
				},
				{
					name: 'eu_aceito_as_condicoes_do_termo_de_uso',
					value: true
				},
				{
					name: 'gclid',
					value: gaGlobal.vid
				},
				{
					name: 'website',
					value: pageRef
				},
				{
					name: 'device',
					value: newDeviceTrial
				},
				{
					name: 'event_hash',
					value: eventHash
				},
			],
			context: {
				pageUri: pageRef,
				pageName: pageRef,
				hutk
			}
		};

		fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		})
			.then(response => response.json())
			.then(data => {
				console.log('Resposta da HubSpot:', data);
			})
			.catch(error => {
				console.error('Erro ao enviar dados para a HubSpot:', error);
			});
	}

	const ciraError = (element, msg) => {
		const erroSpan = document.createElement('span');
		erroSpan.classList.add('text-danger', 'erro-campo');
		erroSpan.innerText = msg || 'Campo inválido!';

		const hasError = document.querySelector(`.erro-trial-${element.name}`);
		if (!hasError) {
			element.style.borderColor = 'red';
			erroSpan.classList.add(`erro-trial-${element.name}`);
			element.insertAdjacentElement('afterend', erroSpan);
		}

	}

	const limparErros = (e) => {
		const erro = document.querySelector(`.erro-trial-${e.target.name}`);
		if (erro) {
			e.target.style.borderColor = 'rgba(255,255,255,.6)';
			erro.remove();
		}
	}

	const formIsValid = (form) => {
		let isValid = true;

		let firstname = form.nickname?.value || false;
		const regexName = /^[\p{L}]+(?: [\p{L}]+)*$/u;
		if (firstname && !regexName.test(firstname.trim())) {
			ciraError(form.nickname, 'Caracteres especiais e alfanúmericos não são válidos!');
			isValid = false;
		}

		if (!form.faturamento.value) {
			ciraError(form.faturamento, 'Selecione uma opção!');
			isValid = false;
		}

		if (!form.objetivo_ao_fazer_o_trial.value) {
			ciraError(form.objetivo_ao_fazer_o_trial, 'Selecione uma opção!');
			isValid = false;
		}

		telefone = /^\([1-9]{2}\)(?:[2-8][0-9]{3}|9[0-9]{4})-[0-9]{4}$/.test(form.phone.value);
		if (!telefone) {
			ciraError(form.phone);
			isValid = false;
		}

		cnpj = /(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/.test(form.document.value);
		if (!cnpj) {
			ciraError(form.document);
			isValid = false;
		}

		email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(form.user_email.value);
		const valor = form.user_email.value;
		if ((valor.includes('@omie')) || (valor.includes('@teste'))) {
			alert("Emails @omie não são permitidos");
			ciraError(form.user_email);
			isValid = false;
		}

		return isValid;
	}

	$('#trial-topo').on('input', e => limparErros(e));


	var form = $('form[name="registerform"]');
	const inputCnpj = document.querySelector('form[name="registerform"] #document');

	var errorMessages = [
		{ field: 'nickname', message: 'Preencha este campo com o seu nome completo' },
		{ field: 'user_email', message: 'Preencha com um e-mail válido, ex. seu@email.com' },
		{ field: 'phone', message: 'O telefone é obrigatório' },
		{ field: 'company', message: 'Qual o nome da empresa?' },
		{ field: 'document', message: 'O documento (CNPJ ou CPF) é obrigatório' },
		{ field: 'accept', message: 'Você precisa aceitar os termos de contrato' }
	];

	var getErrorMessage = function (field) {
		for (var index = 0; index < errorMessages.length; index++) {
			var error = errorMessages[index];

			if (error.field === field) {
				return error.message;
			}
		}
	};

	var preValidPostTimer = undefined;
	var preValidLastCheck = '';
	var preValid = function (targetForm, callback, callbackError) {
		clearTimeout(preValidPostTimer);
		preValidPostTimer = (targetForm.serialize() != preValidLastCheck) && setTimeout(function () {
			_formLock(targetForm, true);
			$.ajax({
				type: 'POST',
				url: 'https://app.omie.com.br/partners/omie/omietrial/?q=prevalid',
				xhrFields: {
					withCredentials: true
				},
				data: targetForm.serialize(),
				success: callback,
				error: callbackError
			});
			preValidLastCheck = targetForm.serialize();
		}, 150);
	};

	var omieShowMessage = function (targetForm, msg, element) {
		var container = targetForm.parent();

		if (typeof element !== 'undefined') {
			var failBlock = $(".text-helper." + element, container);
		} else {
			var failBlock = $(".w-form-fail", container);
		}

		if (typeof msg == 'string' && msg.length > 0) {
			failBlock.html(msg);

			failBlock.show();
		} else {
			failBlock.hide();
		}
	};

	var omieShowMessageFull = function (targetForm, msg) {
		var container = targetForm.parent();

		if (typeof msg == 'string' && msg.length > 0) {
			$('#textModal-experimente').html("");

			container.html(msg);

			container.show();
		} else {
			container.hide();
		}
	};

	var _formLock = function (targetForm, lock) {
		if (lock) {
			targetForm.find('input, textarea, select').addClass('disabled').attr('readonly', true);
			targetForm.find('button,input[type="button"],input[type="submit"]').addClass('disabled').attr('disabled', true);
		} else {
			targetForm.find('input, textarea, select').removeClass('disabled').attr('readonly', false);
			targetForm.find('button,input[type="button"],input[type="submit"]').removeClass('disabled').attr('disabled', false);
		}
	};

	var sendRegisterForm = function (e) {
		var targetForm = $(e.delegateTarget);

		omieShowMessage(targetForm);

		$(".text-helper").html("");
		$('button[name="wp-submit"]>.spinner-border').removeClass('d-none');

		var data = form.serializeArray();
		var error = false;

		for (var index = 0; index < data.length; index++) {
			var field = data[index];

			if (field.name !== "redirect_to" && field.value === "") {
				omieShowMessage(targetForm, getErrorMessage(field.name), field.name);
				error = true;
			}
		}

		var elEmail = $("input[name=user_email]");
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(elEmail.val())) {
			omieShowMessage(targetForm, getErrorMessage('user_email'), 'user_email');
			error = true;
		}

		var accept = data.find(function (field) {
			return field.name === 'accept';
		});

		if (!accept) {
			omieShowMessage(targetForm, getErrorMessage('accept'));
			error = true;
		}

		if (error) {
			$('button[name="wp-submit"]>.spinner-border').addClass('d-none');
			return;
		}

		preValid(targetForm, function validDocument(res) {
			_formLock(targetForm, false);

			if (res.status != 'OK') {
				omieShowMessage(targetForm, res.message, res.field);

				$('button[name="wp-submit"]>.spinner-border').addClass('d-none');
			} else {
				form.submit();
			}
		});
	};

	form.delegate('button[name=wp-submit]', 'click', sendRegisterForm);

	var submitButton = form.find('button[name=wp-submit]');
	$('<input type="hidden" name="token" id="token" value="s47b6hz58z0f">').insertBefore(submitButton);
	form.on("submit", function (e) {
		var targetForm = $(e.delegateTarget);


		e.preventDefault();

		if (!formIsValid(e.target)) {
			return;
		}

		_formLock(targetForm, true);

		$.ajax({
			type: 'POST',
			url: 'https://app.omie.com.br/register/',
			xhrFields: {
				withCredentials: true
			},
			data: targetForm.serialize(),
			success: function (res) {
				if (typeof res !== 'object') {
					omieShowMessage(targetForm, 'Eita! Aconteceu algum problema ao habilitar o aplicativo para você...<br><br>Entre em contato com a gente pelo chat para resolvermos rapidinho com você :)');
				} else if (res.status == 'ERROR' || res.status == 'REGISTER_FAIL') {
					omieShowMessage(targetForm, res.message);
				} else if (res.status == 'REGISTER_DONE') {
					// enviar trial para hub
					const formId = 'e0d52240-0d1c-44b7-a6c1-b92504c3b54d';
					const eventHash = `${formId}_${gaGlobal.vid}_${(new Date()).getTime()}`;
					submitTrialHub(formId, eventHash);
					const faturamentoT = e.target.faturamento.value;

					// omieShowMessageFull(targetForm, "Seu aplicativo foi criado com sucesso. Basta clicar no link de confirmação que foi enviado para o seu e-mail para finalizar :-)");

					const envioFatAds = {
						'81000': {
							'labelTrialFaturamento': 'trial_midia_faturamento_81000',
							'idAdsTrialFaturamento': 'zWo9COfv58UZEK7T_9ID'
						},
						'180000': {
							'labelTrialFaturamento': 'trial_midia_faturamento_180000',
							'idAdsTrialFaturamento': 'FZImCOrv58UZEK7T_9ID'
						},
						'360000': {
							'labelTrialFaturamento': 'trial_midia_faturamento_360000',
							'idAdsTrialFaturamento': 'wDpsCO3v58UZEK7T_9ID'
						},
						'720000': {
							'labelTrialFaturamento': 'trial_midia_faturamento_720000',
							'idAdsTrialFaturamento': 'kecJCOjw58UZEK7T_9ID'
						},
						'1800000': {
							'labelTrialFaturamento': 'trial_midia_faturamento_1800000',
							'idAdsTrialFaturamento': '_KcACOvw58UZEK7T_9ID'
						},
						'4800000': {
							'labelTrialFaturamento': 'trial_midia_faturamento_4800000',
							'idAdsTrialFaturamento': 'GiqSCO7w58UZEK7T_9ID'
						},
						'4800001': {
							'labelTrialFaturamento': 'trial_midia_faturamento_4800001',
							'idAdsTrialFaturamento': 'u8_dCIOpj54aEK7T_9ID'
						}

					};

					var texto = window.location.href;

					if (texto.includes('fit')) {
						dataLayer.push({
							'event': 'Interaction',
							'EventCategory': 'omie-lead-sucesso',
							'EventAction': 'lead-fit-envio-sucesso',
							'TipoLead': 'lead-fit',
							'page_ref': `${texto}`,
							'faturamento': e.target.faturamento.value,
							'event_hash': eventHash,
							...(envioFatAds[faturamentoT])
						});
					} else {
						dataLayer.push({
							'event': 'Interaction',
							'EventCategory': 'omie-lead-sucesso',
							'EventAction': 'lead-trial-envio-sucesso',
							'TipoLead': 'lead-trial',
							'page_ref': `${texto}`,
							'faturamento': e.target.faturamento.value,
							'event_hash': eventHash,
							...(envioFatAds[faturamentoT])
						});

						window.lintrk('track', { conversion_id: 17238465 });

						function uet_report_conversion() { window.uetq = window.uetq || []; window.uetq.push('event', 'submit_lead_trial_bing', {}); }
						uet_report_conversion();

						if (typeof fbq == 'function') {
							fbq('track', 'Purchase', { currency: "USD", value: 30.00 });
						}
					}

					// window.criteo_q = window.criteo_q || [];
					// var deviceType = /iPad/.test(navigator.userAgent) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : "d";
					// window.criteo_q.push(
					// { event: "setAccount", account: 64162},
					// { event: "setEmail", email: "", hash_method: "" },
					// { event: "setSiteType", type: deviceType },
					// { event: "trackTransaction" , id: "", item: [ {id: "1", price: 1, quantity: 1}] }
					// );

					// window.location.href = '/sucesso-trial';
					window.open('/sucesso-trial/', '_blank');
					return;
				}

				$('button[name="wp-submit"]>.spinner-border').addClass('d-none');

				_formLock(targetForm, false);
			},
			error: function (e) {
				let temp = document.createElement('div');
				const responseMessage = e.responseJSON.message;
				temp.innerHTML = DOMPurify.sanitize(responseMessage);
				const newTexto = temp.textContent || temp.innerText || '';

				_formLock(targetForm, false);
				$('button[name="wp-submit"]>.spinner-border').addClass('d-none');
				omieShowMessage(targetForm, newTexto);
			}
		});

		return false;
	});

	const enviaCnpjFetch = (e) => {
		let cnpj = e.target.value;
		cnpj = cnpj.replace(/[^\d]+/g, '');

		// Elimina CNPJs invalidos conhecidos
		if (cnpj == "00000000000000" ||
			cnpj == "11111111111111" ||
			cnpj == "22222222222222" ||
			cnpj == "33333333333333" ||
			cnpj == "44444444444444" ||
			cnpj == "55555555555555" ||
			cnpj == "66666666666666" ||
			cnpj == "77777777777777" ||
			cnpj == "88888888888888" ||
			cnpj == "99999999999999") {
			alert("Adicione um cnpj válido");
			e.target.value = '';
		}
	}

	inputCnpj.addEventListener('change', enviaCnpjFetch);
});

var css = '.disabled { opacity: 0.5; }' +
	'.pwd-group {margin-top: 15px;}.pwd-group .pwd-label {font-size: 10x; padding: 12px 0 12px 7px;text-align: center;vertical-align: middle;}.pwd-group .pwd-box {border-radius: 3px;display: inline-block;width: 20px;height: 9px;background-color: #fefefe;border: 1px solid darkgray;transition: width .4s linear;}.pwd-group.worst .pwd-box.box-0,.pwd-group.bad .pwd-box.box-0,.pwd-group.bad .pwd-box.box-1 {background-color: #ffe4e4;border: 1px solid darkred;color: darkred;}.pwd-group.weak .pwd-box.box-0,.pwd-group.weak .pwd-box.box-1,.pwd-group.weak .pwd-box.box-2 {background-color: #ffe082;border: 1px solid darkorange;color: black;}.pwd-group.good .pwd-box.box-0,.pwd-group.good .pwd-box.box-1,.pwd-group.good .pwd-box.box-2,.pwd-group.good .pwd-box.box-3 {background-color: #66b04e;border: 1px solid green;color: black;}.pwd-group.strong .pwd-box.box-0,.pwd-group.strong .pwd-box.box-1,.pwd-group.strong .pwd-box.box-2,.pwd-group.strong .pwd-box.box-3,.pwd-group.strong .pwd-box.box-4 {background-color: darkgreen;border: 1px solid green;color: white;}' +
	'.w-form-fail {padding-top: 15px;}',
	head = document.head || document.getElementsByTagName('head')[0],
	style = document.createElement('style');

head.appendChild(style);

style.type = 'text/css';
if (style.styleSheet) {
	// This is required for IE8 and below.
	style.styleSheet.cssText = css;
} else {
	style.appendChild(document.createTextNode(css));
}
