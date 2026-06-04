# 📋 Guia de Continuidade - Monstter Site

## Informações do Projeto

**Nome:** Monstter Consultoria e Tecnologia - Sistema de Gestão de Ordens de Serviço
**Repositório:** https://github.com/murilogois82/site-monstter
**Versão Atual:** 685c2e6b
**Data de Criação:** 2026-06-04

---

## 🚀 Como Continuar em Outra Conta Manus Pro

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/murilogois82/site-monstter.git
cd site-monstter
```

### Passo 2: Criar Novo Projeto no Manus

1. Acesse sua conta Manus Pro
2. Clique em "Novo Projeto"
3. Selecione "Web App (tRPC + Manus Auth + Database)"
4. Nomeie como "monstter-site"
5. Clique em "Criar"

### Passo 3: Conectar ao GitHub

1. No painel do Manus, vá para **Settings → GitHub**
2. Clique em "Conectar GitHub"
3. Autorize a integração
4. Configure o repositório: `murilogois82/site-monstter`
5. Selecione a branch: `main`

### Passo 4: Sincronizar Código

```bash
# O Manus fará pull automático do GitHub
# Ou você pode fazer manualmente:
git pull origin main
```

### Passo 5: Configurar Variáveis de Ambiente

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

**Nenhuma configuração manual é necessária!**

### Passo 6: Instalar Dependências e Iniciar

```bash
# No painel do Manus, clique em "Iniciar Servidor"
# Ou via CLI:
pnpm install
pnpm dev
```

### Passo 7: Sincronizar Banco de Dados

```bash
pnpm db:push
```

---

## 📊 Status Atual do Projeto

### ✅ Funcionalidades Implementadas

#### Autenticação e Autorização
- [x] Login com usuário/senha (admin/admin, manager/manager, partner/partner)
- [x] Recuperação de senha por e-mail
- [x] Sistema de roles (admin, manager, partner, user)
- [x] Proteção de rotas baseada em role
- [x] Página de perfil (MyAccount)

#### Gestão de Clientes
- [x] Cadastro de clientes
- [x] Importação em massa de clientes (CSV/Excel)
- [x] Campos de pagamento (tipo fixo/hora, valor)
- [x] Listagem e busca de clientes

#### Gestão de Parceiros
- [x] Cadastro de parceiros/consultores
- [x] Associação de usuários a parceiros
- [x] Campos bancários (CPF, banco, conta, agência)
- [x] Dashboard de parceiros com calendário
- [x] Listagem de ordens de serviço do parceiro

#### Ordens de Serviço
- [x] Criação de OS com número automático
- [x] Seleção de cliente com preenchimento automático
- [x] Cálculo automático de horas com desconto de intervalo
- [x] Formato de data: DD/MM/YYYY HH:MM
- [x] Salvamento e validação de dados
- [x] Encerramento de OS com cálculo de pagamento
- [x] Envio de OS por e-mail para cliente

#### Dashboard Financeiro
- [x] Visualização de receita total
- [x] Gráficos de receita por período
- [x] Cálculo de margem de lucro
- [x] Horas faturáveis
- [x] Pagamentos pendentes
- [x] Comparativo mensal

#### Calendário e Planejamento
- [x] Visualização de OS em calendário
- [x] Indicadores de disponibilidade de parceiros
- [x] Cores por status (draft, in_progress, completed)
- [x] Filtros por período e parceiro
- [x] Estatísticas resumidas

#### Gestão de Usuários
- [x] Tela de gestão de usuários
- [x] Atualização de permissões
- [x] Busca e filtros
- [x] Export de relatório em CSV

#### Relatórios
- [x] Relatório de prestação de serviço
- [x] Export em PDF
- [x] Cálculo de valores por período
- [x] Agendamento de relatórios

### ⚠️ Itens Pendentes

- [ ] Testes automatizados completos
- [ ] Painel de auditoria de usuários
- [ ] Seletor de datas avançado no dashboard financeiro
- [ ] Checkboxes para pagamentos vencidos
- [ ] Dashboard de gestão de OS para parceiros (página separada)
- [ ] Publicação final do projeto

---

## 🔧 Estrutura do Projeto

```
site-monstter/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                   # Páginas principais
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── PartnerDashboard.tsx
│   │   │   ├── ServiceOrderForm.tsx
│   │   │   ├── AdminServiceOrders.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── MyAccount.tsx
│   │   │   └── ...
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── CalendarComponent.tsx
│   │   │   └── ...
│   │   ├── _core/hooks/
│   │   │   └── useLocalAuth.ts      # Hook de autenticação local
│   │   └── lib/
│   │       └── trpc.ts              # Cliente tRPC
│   └── index.html
├── server/                          # Backend Express + tRPC
│   ├── routers.ts                   # Definição de procedures tRPC
│   ├── db.ts                        # Helpers de banco de dados
│   ├── storage.ts                   # Helpers de S3
│   └── _core/                       # Framework core (não editar)
├── drizzle/                         # Schema do banco de dados
│   ├── schema.ts                    # Definição de tabelas
│   └── migrations/                  # Migrações
├── shared/                          # Código compartilhado
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema (admin, manager, partner, user)
- **clients** - Clientes/empresas
- **partners** - Consultores/parceiros
- **service_orders** - Ordens de serviço
- **os_payments** - Pagamentos de OS
- **password_reset_tokens** - Tokens de recuperação de senha

### Executar Migrações

```bash
pnpm db:push
```

---

## 📧 Configuração SMTP

As credenciais SMTP são **automaticamente injetadas** pelo Manus:

```
SMTP_HOST: smtps.uhserver.com
SMTP_PORT: 465
SMTP_USER: [seu e-mail]
SMTP_PASS: [sua senha]
```

**Funcionalidades que usam SMTP:**
- Envio de OS para cliente
- Recuperação de senha
- Notificações de pagamento

---

## 🔑 Credenciais Padrão

### Usuários de Teste

| Usuário | Senha | Role |
|---------|-------|------|
| admin | admin | admin |
| manager | manager | manager |
| partner | partner | partner |
| user | user | user |

**⚠️ Altere essas senhas em produção!**

---

## 🧪 Testes

### Executar Testes

```bash
pnpm test
```

### Testes Disponíveis

- `server/auth.logout.test.ts` - Testes de autenticação
- Adicione mais testes conforme necessário

---

## 🚀 Deploy

### Opção 1: Manus (Recomendado)

1. No painel do Manus, clique em "Publish"
2. Selecione o checkpoint desejado
3. Clique em "Deploy"
4. Acesse via domínio Manus ou domínio personalizado

### Opção 2: GitHub Pages / Vercel

```bash
# Build para produção
pnpm build

# Deploy no Vercel
vercel deploy
```

---

## 📝 Próximos Passos Recomendados

1. **Testes Completos** - Executar suite de testes automatizados
2. **Painel de Auditoria** - Implementar sistema de auditoria
3. **Dashboard Avançado** - Adicionar filtros de data e checkboxes de pagamento
4. **Documentação** - Criar guias de uso para clientes
5. **Publicação** - Deploy em produção com domínio personalizado

---

## 🆘 Troubleshooting

### Erro: "Parceiro não encontrado"

**Solução:** Usuários locais (admin, manager) agora podem criar OS sem ter parceiro associado. O sistema usa o `userId` como `partnerId`.

### Erro: "Banco de dados não sincronizado"

**Solução:**
```bash
pnpm db:push
```

### Erro: "Variáveis de ambiente não carregadas"

**Solução:** Verifique se o projeto está rodando no Manus. Variáveis são injetadas automaticamente.

---

## 📞 Contato e Suporte

**Desenvolvedor:** Manus AI Agent
**Data de Criação:** 2026-06-04
**Última Atualização:** 2026-06-04

---

## 📄 Licença

Propriedade de Monstter Consultoria e Tecnologia
