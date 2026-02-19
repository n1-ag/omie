$(window).on("load", function () {
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj === '') return false;

    if (cnpj.length !== 14)
      return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj === "00000000000000" ||
      cnpj === "11111111111111" ||
      cnpj === "22222222222222" ||
      cnpj === "33333333333333" ||
      cnpj === "44444444444444" ||
      cnpj === "55555555555555" ||
      cnpj === "66666666666666" ||
      cnpj === "77777777777777" ||
      cnpj === "88888888888888" ||
      cnpj === "99999999999999")
      return false;

    // Valida DVs
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
        pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
      return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
        pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
      return false;

    return true;
  }


  function validarCPF(strCPF) {
    strCPF = strCPF.replace(/[^\d]/g, '');
    var Soma;
    var Resto;
    Soma = 0;
    if (strCPF == "00000000000") return false;

    for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
  }

  setTimeout(function () {
    documentInput = $('input[name="document"], input[name="cnpj_do_seu_contador"], input[name="company_document"], input[name="user_document"], input[name="cnpj_empresa_indicada"],input[name="cnpj"]');
    $("<span id='feedback' class='hs-error-msg'></span>").insertAfter(documentInput);

    function toogleValidacao(isValid) {
      if (!isValid) {
        $('#feedback,.hs-error-msg').addClass('text-danger');
        $('#feedback,.hs-error-msg').html("Documento inválido.");
        $('#document').addClass('invalido');
        $('#cnpj').addClass('invalido');
        $('input[type="submit"]').attr("disabled", "disabled");
        $('button[name="wp-submit"]').attr("disabled", "disabled");
      } else {
        $('#feedback,.hs-error-msg').html("");
        $('#document').removeClass('invalido');
        $('#cnpj').removeClass('invalido');
        $('input[type="submit"]').removeAttr("disabled style");
        $('button[name="wp-submit"]').removeAttr("disabled style");
      }
    }

    function mascaraCpfCnpj(input) {
      const value = input.value.replace(/\D/g, '');

      if (input.dataset.document === 'cnpj-cpf') {
        if (value.length <= 11) {
          if (value.length <= 3) {
            input.value = value.replace(/^(\d{0,3})/, '$1');
          } else if (value.length <= 6) {
            input.value = value.replace(/^(\d{0,3})(\d{0,3})/, '$1.$2');
          } else if (value.length <= 9) {
            input.value = value.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})/, '$1.$2.$3');
          } else {
            input.value = value.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, '$1.$2.$3-$4');
            if (!validarCPF(input.value)) {
              toogleValidacao(false);
            } else {
              toogleValidacao(true);
            }
          }
        } else {
          input.setAttribute('maxlength', '18');
          if (value.length <= 2) {
            input.value = value.replace(/^(\d{0,2})/, '$1');
          } else if (value.length <= 5) {
            input.value = value.replace(/^(\d{0,2})(\d{0,3})/, '$1.$2');
          } else if (value.length <= 8) {
            input.value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})/, '$1.$2.$3');
          } else if (value.length <= 12) {
            input.value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})/, '$1.$2.$3/$4');
          } else {
            input.value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, '$1.$2.$3/$4-$5');
            if (!validarCNPJ(input.value)) {
              toogleValidacao(false);
            } else {
              toogleValidacao(true);
            }
          }
        }
      } else {
        input.setAttribute('maxlength', '18');
        if (value.length <= 2) {
          input.value = value.replace(/^(\d{0,2})/, '$1');
        } else if (value.length <= 5) {
          input.value = value.replace(/^(\d{0,2})(\d{0,3})/, '$1.$2');
        } else if (value.length <= 8) {
          input.value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})/, '$1.$2.$3');
        } else if (value.length <= 12) {
          input.value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})/, '$1.$2.$3/$4');
        } else {
          input.value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, '$1.$2.$3/$4-$5');
          if (!validarCNPJ(input.value)) {
            toogleValidacao(false);
          } else {
            toogleValidacao(true);
          }
        }
      }
    }

    documentInput.on("input", function (e) {
      mascaraCpfCnpj(e.target);
    });

  }, 1000);
});

$("body").on(
  "input",
  'input[name="telefone"], input[name="telefone_do_seu_contador"], input[name="phone"], input[name="user_phone"], input[name="telefone_com_ddd"]',

  function (e) {
    let telefone = e.target.value;
    telefone = telefone.replace(/\D/g, '');

    if (telefone.length <= 10) { // Formato para telefone fixo
      telefone = telefone.replace(/^(\d{2})(\d{4})(\d{4})/, '($1)$2-$3');
    } else { // Formato para celular com DDD iniciando com 9
      telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
    }
    e.target.value = telefone;
  }
);