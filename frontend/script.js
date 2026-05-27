const layout = document.querySelector('.split-layout');
const irCadastro = document.getElementById('ir-cadastro');
const irLogin = document.getElementById('ir-login');

irCadastro.addEventListener('click', function (e) {
  e.preventDefault();
  layout.classList.add('modo-cadastro');
});

irLogin.addEventListener('click', function (e) {
  e.preventDefault();
  layout.classList.remove('modo-cadastro');
});

const botaoLogin = document.getElementById("botao-login");
const botaoCadastro = document.getElementById("botao-cadastro");

botaoCadastro.addEventListener('click', async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email-cadastro").value;
  const senha = document.getElementById("senha-cadastro");
  const confirmarSenha = document.getElementById("confirmar-senha");

  if (senha.value != confirmarSenha.value) {

    alert("As senhas não coincidem");

    senha.value = "";
    confirmarSenha.value = "";

    senha.focus();
    return;
  }
  const resposta = await fetch(
    "http://127.0.0.1:8000/cadastro",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        nome: nome,
        email: email,
        senha: senha.value
      })
    }
  );

  if(!resposta.ok){
    alert("Erro ao criar conta! Tente outro email.");
    return;
  }
  alert("Conta criada! Faça login.")
  layout.classList.remove("modo-cadastro");
});

botaoLogin.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;
  try{
    const resposta = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email,
          senha: senha
        })
      }
    );

    if(!resposta.ok){
      throw new Error("Email ou senha inválidos");
    }

    const dados = await resposta.json();
    console.log(dados);
    localStorage.setItem("usuario_id", dados.id)
    window.location.href = "dashboard.html";

  } catch(err){
    console.error(err);
    alert("Email ou senha inválidos");
  }
});