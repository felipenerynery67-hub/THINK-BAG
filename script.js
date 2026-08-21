let usuarioAtual = {
    nome: "Ana Beatriz",
    papel: "aluno",
    turma: "9º ano B"
};

let usuariosCadastrados = JSON.parse(localStorage.getItem('thinkbag_usuarios')) || [
    { nome: "Ana Beatriz", email: "ana.aluna@escola.com", senha: "123", papel: "aluno" },
    { nome: "Prof. Marcos", email: "marcos.prof@escola.com", senha: "123", papel: "professor" }
];

let disciplinasData = [{
        id: 1,
        nome: "Biologia",
        professor: "Prof. Marcos",
        horario: "Hoje, 07:30",
        alerta: "Traga o relatório da aula prática impresso.",
        materiais: [
            { texto: "Livro de Biologia", checked: false },
            { texto: "Caderno", checked: false },
            { texto: "Lápis de cor", checked: false },
            { texto: "Atlas do corpo humano", checked: false }
        ]
    },
    {
        id: 2,
        nome: "Matemática",
        professor: "Profa. Helena",
        horario: "Hoje, 09:20",
        alerta: null,
        materiais: [
            { texto: "Calculadora", checked: false },
            { texto: "Régua", checked: false },
            { texto: "Compasso", checked: false },
            { texto: "Caderno de exercícios", checked: false }
        ]
    }
];

let notificacoes = [
    { titulo: "Hora de arrumar a mochila!", texto: "Você tem itens pendentes para as aulas de amanhã.", tempo: "20:00" },
    { titulo: "Novo material em Biologia", texto: "Prof. Marcos adicionou novos itens.", tempo: "Hoje, 15:12" }
];

function switchAuthTab(tab) {
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const btnLogin = document.getElementById('tab-btn-login');
    const btnCad = document.getElementById('tab-btn-cad');

    if (tab === 'login') {
        formLogin.style.display = 'block';
        formCadastro.style.display = 'none';
        btnLogin.classList.add('active');
        btnCad.classList.remove('active');
    } else {
        formLogin.style.display = 'none';
        formCadastro.style.display = 'block';
        btnCad.classList.add('active');
        btnLogin.classList.remove('active');
    }
}

function setRole(role) {
    usuarioAtual.papel = role;
    document.getElementById('btn-role-aluno').classList.toggle('active', role === 'aluno');
    document.getElementById('btn-role-prof').classList.toggle('active', role === 'professor');

    const btnSubmit = document.getElementById('submit-login-btn');
    const inputEmail = document.getElementById('login-email');

    if (role === 'aluno') {
        btnSubmit.innerText = "Entrar como aluno";
        inputEmail.value = "ana.aluna@escola.com";
    } else {
        btnSubmit.innerText = "Entrar como professor";
        inputEmail.value = "marcos.prof@escola.com";
    }
}

function realizarCadastro(event) {
    event.preventDefault();
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const senha = document.getElementById('cad-senha').value;
    const papel = usuarioAtual.papel;

    let existe = usuariosCadastrados.find(u => u.email === email);
    if (existe) {
        alert("Este e-mail já está cadastrado!");
        return;
    }

    const novoUsuario = { nome, email, senha, papel };
    usuariosCadastrados.push(novoUsuario);
    localStorage.setItem('thinkbag_usuarios', JSON.stringify(usuariosCadastrados));

    alert("Cadastro realizado com sucesso! Entrando no sistema...");

    usuarioAtual = { nome, papel, turma: papel === 'professor' ? 'Docente' : 'Estudante' };
    entrarNoSistemaDashboard();
}

function realizarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    let user = usuariosCadastrados.find(u => u.email === email && u.senha === senha);

    if (!user) {
        alert("E-mail ou senha incorretos!");
        return;
    }

    usuarioAtual = {
        nome: user.nome,
        papel: user.papel,
        turma: user.papel === 'professor' ? 'Docente / Professor' : 'Estudante'
    };

    entrarNoSistemaDashboard();
}

function entrarNoSistemaDashboard() {
    document.getElementById('screen-landing').classList.remove('active');
    document.getElementById('screen-dashboard').classList.add('active');

    document.getElementById('sidebar-username').innerText = usuarioAtual.nome;
    document.getElementById('sidebar-role').innerText = usuarioAtual.turma;
    document.getElementById('welcome-title').innerText = `Olá, ${usuarioAtual.nome.split(' ')[0]}!`;

    const menuProfLi = document.getElementById('menu-prof-li');
    const badgeText = document.getElementById('account-badge-text');

    if (usuarioAtual.papel === 'professor') {
        menuProfLi.style.display = 'block';
        badgeText.innerText = "Conta do professor";
        document.getElementById('welcome-sub').innerText = "Publique os materiais das próximas aulas para suas turmas.";
        mudarAba('publicar-material', document.getElementById('menu-pub'));
    } else {
        menuProfLi.style.display = 'none';
        badgeText.innerText = "Conta do aluno";
        document.getElementById('welcome-sub').innerText = "Confira sua mochila antes de sair de casa.";
        mudarAba('visao-geral', document.getElementById('menu-visao'));
    }

    renderizarTudo();
}

function fazerLogout() {
    document.getElementById('screen-dashboard').classList.remove('active');
    document.getElementById('screen-landing').classList.add('active');
}

function mudarAba(abaId, elementoMenu) {
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + abaId).classList.add('active');

    const links = document.querySelectorAll('.menu-link');
    links.forEach(l => l.classList.remove('active'));
    if (elementoMenu) elementoMenu.classList.add('active');
}

function renderizarTudo() {
    renderizarCardsAulas('dashboard-classes-grid', true);
    renderizarCardsAulas('mochila-classes-grid', true);
    renderizarDisciplinas();
    renderizarNotificacoes();
    atualizarEstatisticas();
}

function renderizarCardsAulas(containerId, comCheckbox) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    disciplinasData.forEach((aula, aulaIndex) => {
        let total = aula.materiais.length;
        let checked = aula.materiais.filter(m => m.checked).length;

        let htmlItens = "";
        aula.materiais.forEach((mat, matIndex) => {
            if (comCheckbox) {
                htmlItens += `
                    <label class="check-item-row">
                        <input type="checkbox" ${mat.checked ? 'checked' : ''} onchange="toggleMaterial(${aulaIndex}, ${matIndex})">
                        <span>${mat.texto}</span>
                    </label>
                `;
            } else {
                htmlItens += `<div style="font-size:13px; padding:6px 0; border-bottom:1px solid var(--border-color);">• ${mat.texto}</div>`;
            }
        });

        let alertaHtml = aula.alerta ? `<div class="alert-box">⚠️ ${aula.alerta}</div>` : "";

        container.innerHTML += `
            <div class="class-card">
                <div class="class-card-top">
                    <div>
                        <h4>${aula.nome}</h4>
                        <span>${aula.professor} • ${aula.horario}</span>
                    </div>
                    <span class="badge-ratio">${checked}/${total}</span>
                </div>
                <div>${htmlItens}</div>
                ${alertaHtml}
            </div>
        `;
    });
}

function toggleMaterial(aulaIndex, matIndex) {
    disciplinasData[aulaIndex].materiais[matIndex].checked = !disciplinasData[aulaIndex].materiais[matIndex].checked;
    renderizarTudo();
}

function atualizarEstatisticas() {
    let total = 0;
    let checked = 0;

    disciplinasData.forEach(a => {
        total += a.materiais.length;
        checked += a.materiais.filter(m => m.checked).length;
    });

    let pending = total - checked;
    let percent = total > 0 ? Math.round((checked / total) * 100) : 0;

    if (document.getElementById('stat-total')) {
        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-checked').innerText = checked;
        document.getElementById('stat-pending').innerText = pending;

        document.getElementById('main-progress-bar').style.width = percent + '%';
        document.getElementById('progress-title-text').innerText = `Mochila pronta em ${percent}%`;
        document.getElementById('progress-sub-text').innerText = pending === 0 ? "🎉 Tudo pronto! Sua mochila está completa." : `Faltam ${pending} itens para as próximas aulas.`;
    }
}

function renderizarDisciplinas() {
    const container = document.getElementById('disciplinas-grid');
    if (!container) return;

    container.innerHTML = "";
    disciplinasData.forEach(d => {
        let listaTexto = d.materiais.map(m => `• ${m.texto}`).join('<br>');
        container.innerHTML += `
            <div class="class-card">
                <div class="class-card-top">
                    <div>
                        <h4>Área de ${d.nome}</h4>
                        <span>${d.professor}</span>
                    </div>
                    <span class="badge-ratio">${d.materiais.length} item(s)</span>
                </div>
                <div style="font-size: 13px; line-height: 1.6;">${listaTexto}</div>
            </div>
        `;
    });
}

function renderizarNotificacoes() {
    const container = document.getElementById('notif-list-container');
    if (!container) return;

    container.innerHTML = "";
    notificacoes.forEach(n => {
        container.innerHTML += `
            <div class="class-card" style="border-left: 4px solid var(--primary); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h4 style="font-size: 15px;">🔔 ${n.titulo}</h4>
                    <span style="font-size: 11px; color: var(--text-muted);">${n.tempo}</span>
                </div>
                <p style="font-size: 13px; color: var(--text-muted);">${n.texto}</p>
            </div>
        `;
    });
}

function publicarNovoMaterial(event) {
    event.preventDefault();
    const disc = document.getElementById('pub-disc').value;
    const horario = document.getElementById('pub-horario').value;
    const itensTexto = document.getElementById('pub-itens').value;
    const aviso = document.getElementById('pub-aviso').value;

    let arrayItens = itensTexto.split('\n').map(i => i.trim()).filter(i => i.length > 0).map(texto => ({ texto, checked: false }));

    disciplinasData.unshift({
        id: disciplinasData.length + 1,
        nome: disc,
        professor: usuarioAtual.nome,
        horario: horario,
        alerta: aviso || null,
        materiais: arrayItens
    });

    notificacoes.unshift({
        titulo: `Novo material em ${disc}`,
        texto: `${usuarioAtual.nome} adicionou nova lista de materiais.`,
        tempo: "Agora"
    });

    alert("Materiais publicados com sucesso!");
    document.getElementById('pub-disc').value = "";
    document.getElementById('pub-horario').value = "";
    document.getElementById('pub-itens').value = "";
    document.getElementById('pub-aviso').value = "";

    mudarAba('visao-geral', document.getElementById('menu-visao'));
    renderizarTudo();
}