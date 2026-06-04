# 🤖 Agente Reutilizável - Monstter Site

## Visão Geral

Este documento descreve como criar e usar um agente reutilizável no Manus para continuar o desenvolvimento do projeto Monstter Site em outra conta Pro.

---

## 📋 Informações do Projeto

```
Nome: Monstter Site - Sistema de Gestão de Ordens de Serviço
Repositório: https://github.com/murilogois82/site-monstter
Tipo: Web App (tRPC + Manus Auth + Database)
Stack: React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL
Status: Em Desenvolvimento
Última Versão: 685c2e6b (2026-06-04)
```

---

## 🎯 Instruções para o Agente

### Contexto do Projeto

O projeto Monstter Site é um **sistema completo de gestão de ordens de serviço** para uma consultoria especializada em TOTVS ERP. O sistema inclui:

- **Autenticação:** Login com usuário/senha, recuperação de senha, roles (admin, manager, partner, user)
- **Gestão de Clientes:** Cadastro, importação em massa, campos de pagamento
- **Gestão de Parceiros:** Cadastro de consultores, associação a usuários, dados bancários
- **Ordens de Serviço:** Criação, cálculo automático de horas, encerramento com pagamento
- **Dashboard Financeiro:** Receita, margem, horas faturáveis, pagamentos pendentes
- **Calendário:** Visualização de OS, disponibilidade de parceiros
- **Relatórios:** Prestação de serviço em PDF, agendamento automático

### Tecnologias Principais

```
Frontend:
- React 19 com TypeScript
- Tailwind CSS 4 para styling
- tRPC para chamadas RPC tipadas
- React Query para gerenciamento de estado
- Wouter para roteamento
- Shadcn/ui para componentes

Backend:
- Express 4 para servidor HTTP
- tRPC 11 para procedures
- Drizzle ORM para banco de dados
- MySQL/TiDB para persistência
- SMTP para envio de e-mail

DevOps:
- Vite para build frontend
- Vitest para testes
- Git para versionamento
- GitHub para repositório
- Manus para hosting
```

### Estrutura de Dados Crítica

#### Tabela: users
```sql
- id: string (primary key)
- openId: string (OAuth ID)
- email: string
- name: string
- password: string (hash bcrypt)
- role: enum ('admin', 'manager', 'partner', 'user')
- createdAt: timestamp
- updatedAt: timestamp
```

#### Tabela: partners
```sql
- id: string (primary key)
- userId: string (foreign key to users)
- companyName: string
- email: string
- phone: string
- cpf: string
- bankName: string
- bankAccount: string
- bankRoutingNumber: string
- paidValue: decimal
- createdAt: timestamp
- updatedAt: timestamp
```

#### Tabela: service_orders
```sql
- id: string (primary key)
- osNumber: string (unique)
- clientId: string (foreign key to clients)
- partnerId: string (foreign key to partners or users)
- serviceType: string
- startDateTime: timestamp
- endDateTime: timestamp
- interval: integer (minutos)
- description: string
- status: enum ('draft', 'in_progress', 'completed', 'cancelled')
- createdAt: timestamp
- updatedAt: timestamp
```

#### Tabela: os_payments
```sql
- id: string (primary key)
- osId: string (foreign key to service_orders)
- paymentType: enum ('fixed', 'hourly')
- hoursWorked: decimal
- hourlyRate: decimal
- fixedAmount: decimal
- totalAmount: decimal
- status: enum ('pending', 'scheduled', 'completed')
- createdAt: timestamp
- updatedAt: timestamp
```

### Fluxos Principais

#### 1. Login
```
Usuário acessa /login
→ Insere usuário e senha
→ Sistema valida em banco de dados
→ Cria sessão JWT
→ Redireciona baseado em role:
  - admin/manager → /admin
  - partner → /partners/dashboard
  - user → /home
```

#### 2. Criar Ordem de Serviço
```
Admin/Manager acessa /service-order-form
→ Seleciona cliente do dropdown
→ Insere datas em formato DD/MM/YYYY HH:MM
→ Sistema calcula horas automaticamente
→ Insere descrição (opcional)
→ Clica "Salvar"
→ Sistema valida dados
→ Cria registro no banco
→ Exibe mensagem de sucesso
```

#### 3. Encerrar Ordem de Serviço
```
Admin/Manager acessa /admin/service-orders
→ Clica "Encerrar" em uma OS
→ Sistema abre diálogo
→ Busca dados do parceiro
→ Calcula valor baseado no tipo de pagamento
→ Preenche campo de valor
→ Admin confirma
→ Sistema cria registro em os_payments
→ Atualiza status da OS para 'completed'
```

#### 4. Dashboard Financeiro
```
Admin acessa /admin/dashboard
→ Sistema busca pagamentos pendentes
→ Calcula total de receita
→ Exibe gráficos de receita por período
→ Mostra horas faturáveis
→ Exibe margem de lucro
```

### Pontos de Atenção

1. **Validação de Datas:** O sistema usa formato DD/MM/YYYY HH:MM. Certifique-se de usar `parseDateTime()` para converter para timestamp.

2. **Cálculo de Horas:** Horas são calculadas como `(endDateTime - startDateTime) - interval`. Sempre validar que `endDateTime > startDateTime`.

3. **Parceiros:** Usuários locais (admin, manager) podem criar OS sem ter parceiro associado. O sistema usa `userId` como `partnerId`.

4. **Pagamentos:** Há dois tipos: `fixed` (valor fixo) e `hourly` (baseado em horas). Implementar lógica de cálculo em `calculatePaymentAmount()`.

5. **E-mail:** Usar SMTP configurado no Manus. Variáveis `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` são injetadas automaticamente.

### Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Parceiro não encontrado" | Usuário sem parceiro associado | Usar userId como partnerId |
| "Data inválida" | Formato incorreto | Usar parseDateTime() |
| "Horas negativas" | endDateTime < startDateTime | Validar antes de salvar |
| "E-mail não enviado" | SMTP não configurado | Verificar variáveis de ambiente |
| "Banco de dados não sincronizado" | Schema desatualizado | Executar pnpm db:push |

---

## 🔄 Workflow de Desenvolvimento

### 1. Clonar Repositório

```bash
git clone https://github.com/murilogois82/site-monstter.git
cd site-monstter
```

### 2. Criar Novo Projeto no Manus

1. Acesse https://manus.im
2. Faça login com sua conta Pro
3. Clique em "Novo Projeto"
4. Selecione "Web App (tRPC + Manus Auth + Database)"
5. Nomeie como "monstter-site"
6. Clique em "Criar"

### 3. Conectar ao GitHub

1. No painel do Manus, vá para **Settings → GitHub**
2. Clique em "Conectar GitHub"
3. Autorize a integração
4. Configure o repositório: `murilogois82/site-monstter`
5. Selecione a branch: `main`

### 4. Sincronizar Código

```bash
# Manus fará pull automático
# Ou manualmente:
git pull origin main
```

### 5. Instalar e Iniciar

```bash
pnpm install
pnpm dev
```

### 6. Sincronizar Banco de Dados

```bash
pnpm db:push
```

### 7. Acessar Aplicação

- URL de Desenvolvimento: `https://3000-[hash].us1.manus.computer`
- URL de Produção: `https://monstterct-[hash].manus.space`

---

## 📝 Tarefas Pendentes

### Fase 1: Testes e Validação
- [ ] Executar suite completa de testes (`pnpm test`)
- [ ] Testar login com todos os roles
- [ ] Testar criação de OS com dados válidos e inválidos
- [ ] Testar cálculo de horas com diferentes intervalos
- [ ] Testar encerramento de OS com cálculo de pagamento
- [ ] Testar envio de e-mail

### Fase 2: Melhorias no Dashboard Financeiro
- [ ] Adicionar seletor de datas (data inicial e final)
- [ ] Implementar filtro de pagamentos pendentes por período
- [ ] Exibir total de pagamentos no período selecionado
- [ ] Adicionar indicador visual para pagamentos vencidos (>20 dias)

### Fase 3: Gestão de Pagamentos
- [ ] Adicionar checkboxes para seleção múltipla de pagamentos
- [ ] Implementar ação em lote (marcar como agendado/concluído)
- [ ] Criar página de gestão de pagamentos
- [ ] Implementar confirmação de pagamento

### Fase 4: Dashboard de Parceiros
- [ ] Criar página PartnerOSManagement.tsx
- [ ] Implementar query para listar OS do parceiro autenticado
- [ ] Adicionar filtros por período, status e cliente
- [ ] Exibir horas trabalhadas e ganhos totais
- [ ] Adicionar gráficos de horas e ganhos por período

### Fase 5: Auditoria
- [ ] Criar tabela de auditoria no banco de dados
- [ ] Implementar funções de registro de auditoria
- [ ] Integrar logging em APIs de alteração
- [ ] Criar página de painel de auditoria
- [ ] Implementar export de relatórios em CSV/PDF

### Fase 6: Publicação
- [ ] Criar checkpoint final
- [ ] Testar fluxo completo em produção
- [ ] Configurar domínio personalizado
- [ ] Deploy em produção
- [ ] Criar documentação para usuários finais

---

## 🧠 Instruções para o Agente IA

Quando continuar este projeto, siga estas diretrizes:

### Antes de Começar
1. Leia este arquivo completamente
2. Leia `CONTINUIDADE.md` para entender a estrutura
3. Leia `todo.md` para ver o status atual
4. Verifique o repositório GitHub para mudanças recentes

### Durante o Desenvolvimento
1. Mantenha `todo.md` atualizado com tarefas concluídas
2. Crie checkpoints regularmente com `webdev_save_checkpoint`
3. Escreva testes para novas funcionalidades
4. Valide mudanças no navegador antes de fazer commit
5. Documente decisões importantes em comentários de código

### Ao Finalizar Tarefas
1. Marque itens como [x] em `todo.md`
2. Crie checkpoint com descrição clara
3. Faça push para GitHub
4. Notifique o usuário sobre progresso

### Padrões de Código
- Use TypeScript para type safety
- Siga padrão tRPC para procedures
- Use componentes Shadcn/ui
- Implemente validação em frontend e backend
- Adicione testes com Vitest

### Segurança
- Nunca hardcode credenciais
- Use variáveis de ambiente do Manus
- Valide entrada do usuário
- Implemente proteção de rotas baseada em role
- Use HTTPS em produção

---

## 📚 Referências Úteis

### Documentação Oficial
- [Manus Docs](https://docs.manus.im)
- [tRPC Docs](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)

### Arquivos Importantes
- `server/routers.ts` - Definição de procedures tRPC
- `server/db.ts` - Helpers de banco de dados
- `client/src/pages/` - Páginas principais
- `drizzle/schema.ts` - Schema do banco de dados
- `package.json` - Dependências do projeto

### Comandos Úteis
```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor de desenvolvimento
pnpm build            # Build para produção
pnpm test             # Executar testes

# Banco de Dados
pnpm db:push          # Sincronizar schema
pnpm db:studio        # Abrir Drizzle Studio

# Git
git status            # Ver status
git add -A            # Adicionar mudanças
git commit -m "msg"   # Fazer commit
git push              # Fazer push
```

---

## ✅ Checklist de Onboarding

Quando começar em nova conta Manus Pro:

- [ ] Clonar repositório do GitHub
- [ ] Criar novo projeto no Manus
- [ ] Conectar ao GitHub
- [ ] Sincronizar código
- [ ] Instalar dependências (`pnpm install`)
- [ ] Sincronizar banco de dados (`pnpm db:push`)
- [ ] Iniciar servidor (`pnpm dev`)
- [ ] Testar login (admin/admin)
- [ ] Testar criação de OS
- [ ] Testar dashboard
- [ ] Ler `todo.md` para próximas tarefas
- [ ] Continuar desenvolvimento

---

## 🎓 Conclusão

Este agente reutilizável contém todas as informações necessárias para continuar o desenvolvimento do Monstter Site em qualquer conta Manus Pro. Siga as instruções acima e o projeto estará pronto para continuar!

**Boa sorte! 🚀**
