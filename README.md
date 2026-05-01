# 🎮 GameStorage — HTML/CSS/JS - API/Pessoal

Aplicação web SPA para gerenciamento de jogos, permitindo controle de progresso, organização por plataformas e análise de dados pessoais.

-> 📁 Estrutura
```
gamestorage-html/
├── index.html          # Único HTML — SPA (entry point)
├── css/
│   └── style.css       # Design system (cores, layout, componentes)
└── js/
    ├── main.js         # Inicialização da aplicação
    ├── router.js       # Roteador SPA (hash-based: #/dashboard)
    ├── auth.js         # Gerenciamento de autenticação (JWT)
    ├── storage.js      # Comunicação com API / camada de dados
    ├── utils.js        # Helpers (toast, validação, debounce)
    ├── components.js   # Componentes reutilizáveis (UI)
    ├── dashboard.js    # Página principal
    ├── login.js        # Página de login
    └── register.js     # Página de cadastro
```

---

## 🔐 Autenticação

O projeto utiliza autenticação via API com JWT (JSON Web Token).
 - Login e cadastro integrados com API
 - Token armazenado no cliente para manter sessão ativa
 - Requisições autenticadas sem necessidade de login constante

---

## 💾 Dados

Os dados são armazenados em PostgreSQL, consumidos via API.
 - Separação por UserID
 - Persistência real (não depende do navegador)
 - Cada usuário acessa apenas seus próprios jogos
 - Segurança baseada em autenticação JWT

---

## 🎮 Funcionalidades

 - ✅ Login / Cadastro com validação
 - ✅ Roteamento SPA sem recarregamento
 - ✅ CRUD completo de jogos
 - ✅ Busca com debounce
 - ✅ Filtros por gênero, plataforma e status
 - ✅ Ordenação por múltiplos campos
 - ✅ Paginação (12 itens por página)
 - ✅ Dashboard com estatísticas:
       - horas jogadas
       - jogos zerados
       - nota média
 - ✅ Toasts de feedback
 - ✅ Validação de formulários
 - ✅ Sanitização básica contra XSS
 - ✅ Responsivo (mobile-first)
 - ✅ Skeleton loading

---

## 🎨 Design

O projeto utiliza um design system próprio, com foco em:
 - Interface moderna e minimalista
 - Componentes reutilizáveis
 - Uso de variáveis CSS (:root)
 - Feedback visual (loading, toasts, estados)
 - Barras de progresso para avaliação e status

---

## ⚙️ Tecnologias
 - HTML5
 - CSS3 (Design System + Responsividade)
 - JavaScript (Vanilla JS)
 - API REST
 - PostgreSQL
 - JWT (Autenticação)

---

## 🧠 Objetivo

Projeto desenvolvido com foco em:
 - Prática de frontend sem frameworks
 - Integração com API real
 - Organização de código em arquitetura modular
 - Construção de interface escalável e reutilizável

---

## 🚀 Observações
 - Projeto focado em estudo e portfólio
 - Estrutura preparada para evolução (ex: novos módulos, melhorias de UI/UX)

---
