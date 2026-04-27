# 🎮 GameVault — HTML/CSS/JS

SPA de gerenciamento de jogos sem frameworks, sem build tools, sem dependências.

## 🚀 Como rodar

**Opção 1 — VS Code com Live Server (recomendado)**
1. Instale a extensão **Live Server** no VS Code
2. Abra a pasta `gamevault-html` no VS Code
3. Clique com botão direito em `index.html` → **Open with Live Server**
4. Abre em `http://127.0.0.1:5500`

**Opção 2 — Python (já vem no sistema)**
```bash
cd gamevault-html
python3 -m http.server 3000
# Acesse: http://localhost:3000
```

**Opção 3 — Node.js**
```bash
cd gamevault-html
npx serve .
```

> ⚠️ **Não abra o `index.html` direto pelo navegador** (file://)  
> Os ES Modules (`type="module"`) exigem um servidor HTTP.

---

## 📁 Estrutura

```
gamevault-html/
├── index.html          # Único HTML — SPA
├── css/
│   └── style.css       # Design system completo
└── js/
    ├── main.js         # Entry point — inicializa app e rotas
    ├── router.js       # Roteador SPA (hash-based: #/dashboard)
    ├── auth.js         # Autenticação mock local
    ├── storage.js      # CRUD no localStorage
    ├── utils.js        # Helpers, toast, validação, debounce
    ├── components.js   # Renderizadores HTML reutilizáveis
    ├── dashboard.js    # Página principal
    ├── login.js        # Página de login
    └── register.js     # Página de cadastro
```

---

## 🔐 Autenticação

O projeto usa **autenticação mock local** — qualquer e-mail/senha válida cria ou loga um usuário. Os dados ficam no `localStorage`.

Para integrar com Firebase futuramente, basta substituir as funções em `js/auth.js` pelas chamadas do SDK do Firebase.

---

## 💾 Dados

Todos os jogos são salvos no `localStorage` do navegador, separados por `userId`. Isso significa:
- Dados persistem entre sessões no mesmo navegador
- Cada usuário vê apenas seus próprios jogos
- Não há sincronização entre dispositivos (sem backend)

---

## 🎮 Funcionalidades

- ✅ Login / Cadastro com validação
- ✅ Roteamento SPA sem recarregar a página
- ✅ CRUD completo de jogos
- ✅ Busca com debounce
- ✅ Filtros por gênero, plataforma e status
- ✅ Ordenação por qualquer campo
- ✅ Paginação (12 por página)
- ✅ Stats pessoais (horas, zerados, nota média)
- ✅ Toasts de feedback
- ✅ Validação de formulários
- ✅ Sanitização básica contra XSS
- ✅ Responsivo (mobile-first)
- ✅ Skeleton loading
