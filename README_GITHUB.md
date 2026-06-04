# 🎯 Monstter Site - Sistema de Gestão de Ordens de Serviço

[![GitHub](https://img.shields.io/badge/GitHub-murilogois82%2Fsite--monstter-blue)](https://github.com/murilogois82/site-monstter)
[![Manus](https://img.shields.io/badge/Hosted%20on-Manus-red)](https://manus.im)
[![License](https://img.shields.io/badge/License-Proprietary-green)]()

## 📋 Sobre o Projeto

**Monstter Site** é um sistema completo de gestão de ordens de serviço desenvolvido para **Monstter Consultoria e Tecnologia**, especializada em consultoria TOTVS ERP.

O sistema permite:
- ✅ Gestão de clientes e parceiros/consultores
- ✅ Criação e acompanhamento de ordens de serviço
- ✅ Cálculo automático de horas e pagamentos
- ✅ Dashboard financeiro com análise de receita
- ✅ Calendário de planejamento com disponibilidade
- ✅ Relatórios em PDF
- ✅ Autenticação com recuperação de senha
- ✅ Sistema de roles e permissões

## 🚀 Quick Start

### Pré-requisitos
- Node.js 22+
- pnpm
- Conta Manus Pro

### 1. Clonar Repositório
```bash
git clone https://github.com/murilogois82/site-monstter.git
cd site-monstter
```

### 2. Criar Projeto no Manus
1. Acesse [Manus](https://manus.im)
2. Clique em "Novo Projeto"
3. Selecione "Web App (tRPC + Manus Auth + Database)"
4. Nomeie como "monstter-site"
5. Clique em "Criar"

### 3. Conectar ao GitHub
1. No painel do Manus, vá para **Settings → GitHub**
2. Clique em "Conectar GitHub"
3. Configure o repositório: `murilogois82/site-monstter`

### 4. Instalar e Iniciar
```bash
pnpm install
pnpm dev
```

### 5. Sincronizar Banco de Dados
```bash
pnpm db:push
```

## 🔐 Credenciais Padrão

| Usuário | Senha | Role |
|---------|-------|------|
| admin | admin | Administrador |
| manager | manager | Gerente |
| partner | partner | Parceiro/Consultor |
| user | user | Usuário Comum |

⚠️ **Altere essas senhas em produção!**

## 📊 Funcionalidades Principais

### 👥 Gestão de Usuários
- Login com usuário/senha
- Recuperação de senha por e-mail
- Perfil de usuário editável
- Sistema de roles (admin, manager, partner, user)

### 👨‍💼 Gestão de Clientes
- Cadastro de clientes
- Importação em massa (CSV/Excel)
- Campos de pagamento (fixo/hora)
- Busca e filtros

### 🤝 Gestão de Parceiros
- Cadastro de consultores
- Dados bancários
- Associação a usuários
- Dashboard com calendário

### 📋 Ordens de Serviço
- Criação com número automático
- Seleção de cliente com preenchimento automático
- Cálculo automático de horas
- Formato de data: DD/MM/YYYY HH:MM
- Encerramento com cálculo de pagamento
- Envio por e-mail

### 💰 Dashboard Financeiro
- Receita total
- Gráficos de receita por período
- Margem de lucro
- Horas faturáveis
- Pagamentos pendentes

### 📅 Calendário
- Visualização de OS agendadas
- Indicadores de disponibilidade
- Filtros por período e parceiro
- Cores por status

### 📄 Relatórios
- Prestação de serviço em PDF
- Cálculo de valores por período
- Agendamento automático
- Export em CSV

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS 4** - Styling
- **tRPC** - Type-safe RPC
- **React Query** - State Management
- **Shadcn/ui** - Component Library
- **Wouter** - Routing

### Backend
- **Express 4** - HTTP Server
- **tRPC 11** - RPC Framework
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database
- **Node Mailer** - Email

### DevOps
- **Vite** - Build Tool
- **Vitest** - Testing
- **Git** - Version Control
- **GitHub** - Repository
- **Manus** - Hosting

## 📁 Estrutura do Projeto

```
site-monstter/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/          # Páginas principais
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── _core/          # Hooks e utilitários
│   │   └── lib/            # Bibliotecas
│   └── index.html
├── server/                  # Backend Express + tRPC
│   ├── routers.ts          # Procedures tRPC
│   ├── db.ts               # Database helpers
│   ├── storage.ts          # S3 helpers
│   └── _core/              # Framework core
├── drizzle/                # Database
│   ├── schema.ts           # Definição de tabelas
│   └── migrations/         # Migrações
├── shared/                 # Código compartilhado
├── CONTINUIDADE.md         # Guia de continuidade
├── AGENTE_REUTILIZAVEL.md  # Instruções para agente IA
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Modo watch
pnpm test --watch

# Com cobertura
pnpm test --coverage
```

## 📦 Scripts Disponíveis

```bash
pnpm dev              # Iniciar desenvolvimento
pnpm build            # Build para produção
pnpm test             # Executar testes
pnpm format           # Formatar código
pnpm db:push          # Sincronizar schema
pnpm db:studio        # Abrir Drizzle Studio
```

## 🚀 Deploy

### No Manus (Recomendado)
1. No painel do Manus, clique em "Publish"
2. Selecione o checkpoint desejado
3. Clique em "Deploy"

### Em Outro Host
```bash
pnpm build
# Deploy a pasta 'dist'
```

## 📝 Documentação

- **[CONTINUIDADE.md](./CONTINUIDADE.md)** - Guia de continuidade em outra conta Manus
- **[AGENTE_REUTILIZAVEL.md](./AGENTE_REUTILIZAVEL.md)** - Instruções para agente IA
- **[todo.md](./todo.md)** - Status das tarefas

## 🔧 Configuração

### Variáveis de Ambiente (Manus)

As seguintes variáveis são **automaticamente injetadas** pelo Manus:

```
BUILT_IN_FORGE_API_KEY
BUILT_IN_FORGE_API_URL
JWT_SECRET
OAUTH_SERVER_URL
OWNER_NAME
OWNER_OPEN_ID
SMTP_HOST
SMTP_PASS
SMTP_PORT
SMTP_USER
VITE_ANALYTICS_ENDPOINT
VITE_ANALYTICS_WEBSITE_ID
VITE_APP_ID
VITE_APP_LOGO
VITE_APP_TITLE
VITE_FRONTEND_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_URL
VITE_OAUTH_PORTAL_URL
```

## 🐛 Troubleshooting

### Erro: "Parceiro não encontrado"
Usuários locais podem criar OS sem parceiro. O sistema usa `userId` como `partnerId`.

### Erro: "Banco de dados não sincronizado"
```bash
pnpm db:push
```

### Erro: "Variáveis de ambiente não carregadas"
Verifique se o projeto está rodando no Manus. Variáveis são injetadas automaticamente.

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação Manus](https://docs.manus.im)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Docs](https://orm.drizzle.team)

## 📄 Licença

Propriedade de Monstter Consultoria e Tecnologia

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ usando Manus AI Agent

**Data de Criação:** 2026-06-04
**Última Atualização:** 2026-06-04

---

## 🎯 Próximos Passos

1. Clonar repositório
2. Criar projeto no Manus
3. Conectar ao GitHub
4. Instalar dependências
5. Sincronizar banco de dados
6. Iniciar servidor
7. Consultar `todo.md` para tarefas pendentes

**Boa sorte! 🚀**
