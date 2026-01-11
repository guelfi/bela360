# bela360 - Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Automatizar o fluxo completo de agendamento para negócios de beleza via WhatsApp
- Reduzir no-shows (faltas) em pelo menos 50% através de lembretes automáticos
- Permitir que donos de negócio economizem 10+ horas/semana em tarefas administrativas
- Oferecer MVP gratuito que gere valor percebido em menos de 7 dias
- Criar base para modelo freemium escalável

### Background Context

O mercado de beleza no Brasil é fragmentado, com milhões de pequenos negócios operando de forma manual. WhatsApp é o canal dominante de comunicação, mas usado de forma desorganizada. Soluções existentes são caras, complexas e ignoram a realidade mobile-first dos profissionais. O bela360 resolve isso com automação inteligente via WhatsApp, curva de aprendizado zero e custo inicial gratuito.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-04 | 0.1 | Versão inicial do PRD | BMad Orchestrator |
| 2026-01-05 | 0.2 | Adicionados Epics 6-10: Automação de Relacionamento, Lista de Espera, Multi-Profissional, Financeiro Real, Marketing Básico | BMad Orchestrator |
| 2026-01-05 | 0.3 | Adicionados Epics 11-13: Programa de Fidelidade, Controle de Estoque, Perfil Profissional. Expandido Epic 10 com IA | BMad Orchestrator |
| 2026-01-07 | 0.4 | Gap Analysis: Adicionadas Stories 2.7, 5.6, 6.1 (NPS), 9.6, 9.7, 10.8, 10.9. Baseado em análise de expertise do setor | BMad Orchestrator |
| 2026-01-10 | 0.5 | Market Analysis Gaps: Adicionadas Stories 2.8 (Pontualidade), 8.5 (Projeção Ganhos Profissional), 8.6 (Substituto/Backup), 9.8 (Gateways: Stripe, MercadoPago, PagSeguro, Stone) | BMad Orchestrator |

---

## Requirements

### Functional Requirements

**FR1:** O sistema deve permitir que clientes finais agendem serviços via chatbot WhatsApp, selecionando serviço, profissional e horário disponível.

**FR2:** O sistema deve exibir apenas horários disponíveis na agenda do profissional durante o processo de agendamento.

**FR3:** O sistema deve enviar confirmação automática via WhatsApp imediatamente após agendamento realizado.

**FR4:** O sistema deve enviar lembrete automático 24 horas antes do horário agendado.

**FR5:** O sistema deve enviar lembrete com opção de confirmação 2 horas antes do agendamento.

**FR6:** O sistema deve permitir que o cliente cancele ou reagende via WhatsApp respondendo ao lembrete.

**FR7:** O sistema deve notificar o profissional sobre novos agendamentos, cancelamentos e no-shows.

**FR8:** O sistema deve manter cadastro de clientes com nome, telefone, histórico de atendimentos e observações.

**FR9:** O sistema deve fornecer dashboard web responsivo para o profissional visualizar agenda do dia/semana.

**FR10:** O sistema deve permitir que o profissional bloqueie horários na agenda (folgas, almoço, etc).

**FR11:** O sistema deve permitir cadastro de serviços oferecidos com nome, duração e preço.

**FR12:** O sistema deve gerar relatórios básicos: agendamentos do período, taxa de no-show, clientes novos vs recorrentes.

**FR13:** O sistema deve permitir que o profissional configure horários de funcionamento (dias e horários).

**FR14:** O sistema deve permitir onboarding completo do negócio em menos de 15 minutos.

**FR15:** O sistema deve funcionar 24/7, permitindo agendamentos fora do horário comercial.

### Non-Functional Requirements

**NFR1:** O sistema deve responder a mensagens do WhatsApp em menos de 3 segundos.

**NFR2:** O dashboard web deve carregar em menos de 2 segundos em conexões 4G.

**NFR3:** O sistema deve ter disponibilidade de 99.5% (downtime máximo de ~3.6h/mês).

**NFR4:** O sistema deve ser compatível com LGPD, com opção de exclusão de dados do cliente.

**NFR5:** O sistema deve usar free tiers de cloud sempre que possível para minimizar custos.

**NFR6:** O sistema deve suportar pelo menos 100 negócios simultâneos no MVP.

**NFR7:** O sistema deve ser mobile-first, com todas as funcionalidades acessíveis via smartphone.

**NFR8:** O sistema deve ter interface em português brasileiro.

**NFR9:** O sistema deve manter logs de auditoria de todas as ações críticas (agendamentos, cancelamentos).

**NFR10:** O sistema deve ter backup automático diário dos dados.

---

## User Interface Design Goals

### Overall UX Vision

Interface minimalista, mobile-first, com foco em ações rápidas. O profissional deve conseguir ver a agenda do dia e agir (confirmar, cancelar, bloquear horário) em no máximo 3 toques. Visual limpo, cores neutras com acentos em roxo/rosa (remetendo ao universo da beleza).

### Key Interaction Paradigms

- **Dashboard único:** Tudo que importa em uma tela
- **Cards de agendamento:** Visualização rápida com ações inline
- **Bottom navigation:** Navegação mobile-friendly
- **Pull-to-refresh:** Atualização natural
- **Skeleton loading:** Feedback visual durante carregamento

### Core Screens and Views

1. **Tela de Login/Onboarding** - Cadastro simplificado via WhatsApp
2. **Dashboard Principal** - Agenda do dia com próximos agendamentos
3. **Agenda Semanal** - Visualização calendário da semana
4. **Lista de Clientes** - CRM básico com busca
5. **Perfil do Cliente** - Histórico e observações
6. **Configurações** - Serviços, horários, preferências
7. **Relatórios** - Métricas básicas do negócio

### Accessibility

WCAG AA - Garantir contraste adequado, navegação por teclado, labels em formulários.

### Branding

- **Cores principais:** Roxo (#7C3AED), Rosa (#EC4899), Branco (#FFFFFF)
- **Tipografia:** Inter ou similar (moderna, legível)
- **Ícones:** Linha fina, estilo minimalista
- **Tom:** Profissional mas acolhedor, sem ser infantil

### Target Devices and Platforms

Web Responsive - Mobile-first, mas funcional em desktop. Foco em smartphones Android e iOS via browser.

---

## Technical Assumptions

### Repository Structure

**Monorepo** - Simplicidade para MVP com frontend e backend no mesmo repositório. Estrutura sugerida:

```
/bela360
├── /apps
│   ├── /web          # Frontend Next.js
│   └── /api          # Backend Node.js
├── /packages
│   └── /shared       # Tipos e utilitários compartilhados
└── /infra            # IaC e configurações
```

### Service Architecture

**Monolito Modular** - Arquitetura monolítica com separação clara de módulos internos para facilitar futura extração para microserviços se necessário.

Módulos principais:
- **Auth:** Autenticação via WhatsApp
- **Scheduling:** Agendamentos e agenda
- **Notifications:** Mensagens WhatsApp
- **CRM:** Gestão de clientes
- **Analytics:** Métricas e relatórios

### Testing Requirements

- **Unit tests:** Cobertura mínima de 70% em lógica de negócio
- **Integration tests:** Fluxos críticos (agendamento, notificações)
- **E2E tests:** Fluxo principal de agendamento (Playwright)
- **Manual testing:** QA em dispositivos reais antes de releases

### Additional Technical Assumptions

- **WhatsApp API:** Usar Evolution API (open source) para MVP, migrar para Cloud API oficial se escalar
- **Database:** PostgreSQL hospedado em Supabase (free tier) ou Neon
- **Cache:** Redis para sessões e cache de disponibilidade
- **Queue:** Bull/BullMQ para processamento de mensagens assíncronas
- **Hosting:** Vercel (frontend) + Railway ou Render (backend)
- **Monitoramento:** Sentry para erros, Uptime Robot para disponibilidade
- **CI/CD:** GitHub Actions para deploy automático

---

## Epic List

### Epic 1: Foundation & Core Setup
**Goal:** Estabelecer infraestrutura base do projeto com autenticação via WhatsApp e primeira funcionalidade de saúde do sistema.

### Epic 2: Scheduling Core
**Goal:** Implementar o core de agendamentos - cadastro de serviços, agenda do profissional e fluxo de agendamento via WhatsApp.

### Epic 3: Notifications & Reminders
**Goal:** Sistema de notificações automáticas - confirmações, lembretes e alertas de no-show.

### Epic 4: Client Management (CRM)
**Goal:** Gestão de clientes com histórico, observações e busca.

### Epic 5: Analytics & Dashboard
**Goal:** Dashboard completo com métricas, relatórios e visão do negócio.

### Epic 6: Automação de Relacionamento
**Goal:** Automatizar comunicação pós-atendimento para fidelização - mensagens de agradecimento, retorno, aniversário e reativação de inativos.

### Epic 7: Lista de Espera Inteligente
**Goal:** Permitir que clientes entrem em lista de espera quando horário desejado não está disponível, com notificação automática quando liberar.

### Epic 8: Multi-Profissional (Equipe)
**Goal:** Suportar salões com múltiplos profissionais, cada um com sua agenda, serviços e comissões próprias.

### Epic 9: Controle Financeiro Real
**Goal:** Gestão financeira completa com registro de pagamentos, comissões por profissional, caixa diário e relatórios financeiros.

### Epic 10: Marketing Inteligente
**Goal:** Ferramentas de marketing com segmentação de clientes, campanhas automáticas baseadas em comportamento e sugestões inteligentes via IA.

### Epic 11: Programa de Fidelidade
**Goal:** Sistema de pontos e recompensas para fidelização de clientes, com níveis, benefícios automáticos e cashback.

### Epic 12: Controle de Estoque
**Goal:** Gestão de produtos e insumos vinculados aos serviços, com alertas de reposição e controle de custos.

### Epic 13: Perfil Profissional & Gamificação
**Goal:** Mini-site público para cada profissional, sistema de avaliações, metas e ranking para motivação da equipe.

### Epic 14: Ecossistema e Marketplace
**Goal:** Criar um ecossistema completo além do software, com marketplace de produtos, educação, comunidade e white-label para gerar valor contínuo e receita adicional.

---

## Epic Details

---

## Epic 1: Foundation & Core Setup

**Goal:** Estabelecer a base técnica do projeto incluindo setup do monorepo, configuração de CI/CD, integração inicial com WhatsApp e autenticação. Entregar uma página de status funcional e login básico via WhatsApp.

### Story 1.1: Project Setup & Infrastructure

**As a** developer,
**I want** a properly configured monorepo with frontend and backend,
**so that** I can start building features on a solid foundation.

**Acceptance Criteria:**
1. Monorepo configurado com pnpm workspaces
2. Frontend Next.js 14+ com TypeScript configurado em /apps/web
3. Backend Node.js com TypeScript configurado em /apps/api
4. ESLint e Prettier configurados com regras consistentes
5. GitHub repository com branch protection em main
6. README com instruções de setup local
7. Scripts de dev, build e test funcionando

---

### Story 1.2: CI/CD Pipeline

**As a** developer,
**I want** automated testing and deployment,
**so that** changes are validated and deployed automatically.

**Acceptance Criteria:**
1. GitHub Actions workflow para CI (lint, type-check, tests)
2. Deploy automático do frontend para Vercel em push para main
3. Deploy automático do backend para Railway/Render em push para main
4. Status checks obrigatórios antes de merge
5. Notificação de falha de build no GitHub

---

### Story 1.3: Database Setup

**As a** developer,
**I want** a PostgreSQL database configured,
**so that** I can persist application data.

**Acceptance Criteria:**
1. PostgreSQL provisionado (Supabase ou Neon free tier)
2. Prisma ORM configurado com schema inicial
3. Migrations funcionando em ambiente local e produção
4. Seed script para dados de desenvolvimento
5. Variáveis de ambiente configuradas para diferentes ambientes

---

### Story 1.4: WhatsApp Integration Setup

**As a** developer,
**I want** WhatsApp messaging capability,
**so that** the system can send and receive messages.

**Acceptance Criteria:**
1. Evolution API ou WhatsApp Cloud API configurada
2. Webhook endpoint para receber mensagens
3. Função para enviar mensagens de texto simples
4. Health check da conexão WhatsApp
5. Logs de mensagens enviadas/recebidas
6. Documentação de setup do WhatsApp

---

### Story 1.5: Authentication via WhatsApp

**As a** business owner,
**I want** to login using my WhatsApp number,
**so that** I don't need to remember another password.

**Acceptance Criteria:**
1. Fluxo de login: usuário informa número WhatsApp
2. Sistema envia código de verificação via WhatsApp
3. Usuário insere código para autenticar
4. Sessão JWT criada com validade de 7 dias
5. Refresh token para renovação automática
6. Logout funcional

---

### Story 1.6: Health Check & Status Page

**As a** developer,
**I want** a health check endpoint and status page,
**so that** I can monitor system availability.

**Acceptance Criteria:**
1. Endpoint GET /health retornando status de serviços (DB, WhatsApp)
2. Página web simples mostrando status do sistema
3. Resposta em menos de 500ms
4. Integração com Uptime Robot ou similar para monitoramento

---

## Epic 2: Scheduling Core

**Goal:** Implementar o sistema central de agendamentos, permitindo que profissionais configurem seus serviços e horários, e que clientes agendem via WhatsApp.

### Story 2.1: Business Profile Setup

**As a** business owner,
**I want** to configure my business profile,
**so that** clients can see my information.

**Acceptance Criteria:**
1. Formulário de cadastro: nome do negócio, endereço, telefone
2. Upload de foto/logo do negócio
3. Configuração de horário de funcionamento (dias e horas)
4. Definição de intervalo entre agendamentos (ex: 30min)
5. Preview de como o perfil aparece para clientes
6. Dados persistidos no banco

---

### Story 2.2: Service Catalog Management

**As a** business owner,
**I want** to manage my services catalog,
**so that** clients know what I offer.

**Acceptance Criteria:**
1. CRUD de serviços (nome, descrição, duração, preço)
2. Ordenação de serviços por drag-and-drop
3. Ativar/desativar serviço sem deletar
4. Validação: nome obrigatório, duração mínima 15min
5. Lista de serviços visível no dashboard

---

### Story 2.3: Calendar & Availability

**As a** business owner,
**I want** to see and manage my calendar,
**so that** I know my schedule and can block times.

**Acceptance Criteria:**
1. Visualização de agenda diária com slots de tempo
2. Visualização semanal tipo calendário
3. Bloquear horário (folga, almoço, compromisso)
4. Desbloquear horário bloqueado
5. Indicação visual de slots ocupados vs disponíveis vs bloqueados
6. Pull-to-refresh para atualizar

---

### Story 2.4: WhatsApp Booking Bot - Flow Design

**As a** client,
**I want** to book an appointment via WhatsApp,
**so that** I can schedule without calling.

**Acceptance Criteria:**
1. Cliente inicia conversa, bot apresenta menu (Agendar, Ver agendamentos, Falar com humano)
2. Fluxo "Agendar": mostra serviços disponíveis como opções numeradas
3. Cliente seleciona serviço, bot mostra próximos 5 horários disponíveis
4. Cliente seleciona horário, bot confirma dados
5. Cliente confirma, agendamento é criado
6. Bot envia confirmação com detalhes e opção de cancelar
7. Timeout de 5 minutos de inatividade retorna ao menu

---

### Story 2.5: Appointment Creation & Storage

**As a** system,
**I want** to persist appointments correctly,
**so that** the schedule is always accurate.

**Acceptance Criteria:**
1. Modelo Appointment: clientId, serviceId, datetime, status, notes
2. Status possíveis: scheduled, confirmed, completed, cancelled, no-show
3. Validação: não permitir agendamento em horário já ocupado
4. Validação: respeitar horário de funcionamento
5. Validação: respeitar duração do serviço (não sobrepor)
6. Notificação ao profissional via WhatsApp de novo agendamento

---

### Story 2.6: Appointment List for Professional

**As a** business owner,
**I want** to see today's appointments,
**so that** I can prepare for my clients.

**Acceptance Criteria:**
1. Lista de agendamentos do dia no dashboard
2. Card de agendamento: hora, cliente, serviço, status
3. Ações rápidas: confirmar, cancelar, marcar como no-show
4. Filtro por status
5. Ordenação cronológica
6. Indicador de próximo agendamento

---

### Story 2.7: Bloqueio Automático de Horários Estratégicos

**As a** business owner,
**I want** the system to automatically suggest or block low-demand time slots,
**so that** I can optimize my schedule and reduce idle time.

**Acceptance Criteria:**
1. Sistema analisa histórico de agendamentos dos últimos 90 dias
2. Identifica horários com menos de 20% de ocupação média
3. Sugere bloqueio ou promoção para horários ociosos
4. Opção de bloqueio automático de horários nunca usados
5. Relatório de horários ociosos por dia da semana
6. Notificação semanal com sugestões de otimização
7. Toggle para ativar/desativar bloqueio automático

---

### Story 2.8: Controle de Pontualidade e Atrasos

**As a** business owner,
**I want** to track actual start times versus scheduled times,
**so that** I can improve punctuality and client satisfaction.

**Acceptance Criteria:**
1. Registro de horário real de início do atendimento (check-in)
2. Registro de horário real de término (check-out)
3. Cálculo automático de atraso: início real - horário agendado
4. Indicador visual de atraso na agenda (verde = pontual, amarelo = até 10min, vermelho = >10min)
5. Notificação ao cliente quando profissional está atrasado
6. Mensagem configurável: "Seu atendimento está X minutos atrasado, pedimos desculpas"
7. Métricas de pontualidade por profissional
8. Relatório semanal de pontualidade da equipe
9. Ranking de profissionais mais pontuais
10. Alerta para dono se profissional tem padrão de atrasos
11. Tempo médio de espera por cliente visível no perfil
12. Opção de compensação automática (desconto) para atrasos longos
13. Histórico de atrasos por cliente (para entender impacto)
14. Meta de pontualidade configurável (ex: 95% em até 5min)

---

## Epic 3: Notifications & Reminders

**Goal:** Automatizar comunicação com clientes através de confirmações, lembretes e follow-ups via WhatsApp.

### Story 3.1: Confirmation Message

**As a** client,
**I want** to receive a confirmation after booking,
**so that** I know my appointment is scheduled.

**Acceptance Criteria:**
1. Mensagem enviada imediatamente após agendamento
2. Conteúdo: serviço, data, hora, endereço
3. Inclui link/código para cancelar se necessário
4. Template configurável pelo profissional
5. Log de mensagem enviada

---

### Story 3.2: 24h Reminder

**As a** client,
**I want** to receive a reminder 24 hours before,
**so that** I don't forget my appointment.

**Acceptance Criteria:**
1. Job agendado para enviar 24h antes do horário
2. Mensagem: lembrete do agendamento com detalhes
3. Não enviar se agendamento já cancelado
4. Log de envio
5. Retry em caso de falha (até 3 tentativas)

---

### Story 3.3: 2h Confirmation Request

**As a** business owner,
**I want** to confirm attendance 2 hours before,
**so that** I can fill the slot if client cancels.

**Acceptance Criteria:**
1. Mensagem 2h antes pedindo confirmação
2. Opções: "Confirmo" ou "Preciso cancelar"
3. Se confirma: status atualizado para "confirmed"
4. Se cancela: status atualizado, slot liberado
5. Se não responde: status permanece "scheduled"
6. Profissional recebe notificação de confirmação/cancelamento

---

### Story 3.4: No-Show Detection & Notification

**As a** business owner,
**I want** to be notified of no-shows,
**so that** I can manage my time.

**Acceptance Criteria:**
1. 30 minutos após horário do agendamento, verificar se foi marcado como completado
2. Se não, notificar profissional: "Cliente X não compareceu às HH:MM?"
3. Opções: "Não veio" ou "Está aqui"
4. Se "Não veio": marcar como no-show, registrar no histórico do cliente
5. Métricas de no-show atualizadas

---

### Story 3.5: Queue System for Messages

**As a** developer,
**I want** a reliable message queue,
**so that** notifications are delivered even under load.

**Acceptance Criteria:**
1. Bull/BullMQ configurado com Redis
2. Filas separadas: confirmations, reminders, alerts
3. Processamento assíncrono de mensagens
4. Dashboard de filas (Bull Board)
5. Dead letter queue para falhas
6. Rate limiting para respeitar limites do WhatsApp

---

## Epic 4: Client Management (CRM)

**Goal:** Permitir gestão de clientes com histórico de atendimentos, observações e busca.

### Story 4.1: Client Auto-Registration

**As a** system,
**I want** to auto-register clients when they book,
**so that** I have their information for future use.

**Acceptance Criteria:**
1. Cliente criado automaticamente no primeiro agendamento
2. Dados capturados: telefone WhatsApp, nome (perguntado pelo bot)
3. Vinculação automática de agendamentos ao cliente
4. Detecção de cliente existente pelo telefone

---

### Story 4.2: Client List & Search

**As a** business owner,
**I want** to see and search my clients,
**so that** I can find their information quickly.

**Acceptance Criteria:**
1. Lista de clientes com nome e telefone
2. Busca por nome ou telefone
3. Ordenação alfabética ou por última visita
4. Paginação ou infinite scroll
5. Contador de total de clientes

---

### Story 4.3: Client Profile & History

**As a** business owner,
**I want** to see a client's history,
**so that** I can personalize the service.

**Acceptance Criteria:**
1. Perfil do cliente: nome, telefone, data de cadastro
2. Histórico de agendamentos (serviço, data, status)
3. Contadores: total de visitas, no-shows, última visita
4. Campo de observações editável (ex: "alérgica a amônia")
5. Botão para iniciar conversa no WhatsApp

---

### Story 4.4: Client Notes & Tags

**As a** business owner,
**I want** to add notes and tags to clients,
**so that** I remember important details.

**Acceptance Criteria:**
1. Campo de observações com texto livre
2. Tags pré-definidas: VIP, Problemático, Novo, Fiel
3. Tags customizáveis pelo usuário
4. Filtro de clientes por tag
5. Notas visíveis no card de agendamento

---

## Epic 5: Analytics & Dashboard

**Goal:** Fornecer visão do negócio através de métricas, relatórios e insights acionáveis.

### Story 5.1: Dashboard Overview

**As a** business owner,
**I want** to see key metrics at a glance,
**so that** I understand my business performance.

**Acceptance Criteria:**
1. Cards de métricas: agendamentos hoje, semana, mês
2. Taxa de no-show do mês
3. Clientes novos vs recorrentes do mês
4. Próximos agendamentos do dia
5. Atualização automática a cada 5 minutos

---

### Story 5.2: Appointment Statistics

**As a** business owner,
**I want** to see appointment trends,
**so that** I can optimize my schedule.

**Acceptance Criteria:**
1. Gráfico de agendamentos por dia (últimos 30 dias)
2. Breakdown por status (completados, cancelados, no-shows)
3. Horários mais populares
4. Serviços mais agendados
5. Filtro por período

---

### Story 5.3: Client Analytics

**As a** business owner,
**I want** to understand my client base,
**so that** I can improve retention.

**Acceptance Criteria:**
1. Total de clientes ativos (agendaram nos últimos 60 dias)
2. Novos clientes por mês
3. Taxa de retorno (clientes que voltaram)
4. Top 10 clientes por número de visitas
5. Clientes que não voltaram há mais de 30 dias

---

### Story 5.4: Revenue Insights (Basic)

**As a** business owner,
**I want** to estimate my revenue,
**so that** I can track my earnings.

**Acceptance Criteria:**
1. Faturamento estimado (baseado em preço dos serviços agendados)
2. Breakdown por serviço
3. Comparativo mês anterior
4. Nota: "Estimativa baseada em agendamentos completados"
5. Filtro por período

---

### Story 5.5: Export & Reports

**As a** business owner,
**I want** to export my data,
**so that** I can analyze offline or share.

**Acceptance Criteria:**
1. Exportar agendamentos do período (CSV)
2. Exportar lista de clientes (CSV)
3. Relatório mensal resumido (PDF)
4. Envio do relatório por e-mail ou WhatsApp
5. Histórico de relatórios gerados

---

### Story 5.6: Alertas Proativos de Risco

**As a** business owner,
**I want** to receive proactive alerts about business risks,
**so that** I can take corrective action before problems become serious.

**Acceptance Criteria:**
1. Alerta de queda de faturamento (>15% vs período anterior)
2. Alerta de aumento de no-shows (>10% do total)
3. Alerta de profissional improdutivo (ocupação <50% na semana)
4. Alerta de cliente VIP inativo há 30+ dias
5. Alerta de servico com demanda em queda
6. Notificação via WhatsApp e/ou dashboard
7. Sugestões de ação para cada tipo de alerta
8. Histórico de alertas com status (resolvido/pendente)
9. Configuração de thresholds personalizados

---

## Epic 6: Automação de Relacionamento

**Goal:** Automatizar comunicação pós-atendimento para fidelização - mensagens de agradecimento, retorno, aniversário e reativação de inativos.

### Story 6.1: Mensagem Pós-Atendimento com NPS

**As a** business owner,
**I want** clients to receive a thank you message after their appointment with satisfaction survey,
**so that** they feel valued and I can measure service quality.

**Acceptance Criteria:**
1. Mensagem automática enviada 2 horas após horário do agendamento completado
2. Mensagem personalizável com nome do cliente e serviço realizado
3. Inclui pedido de avaliação (1-5 estrelas via botões)
4. Resposta de avaliação registrada no perfil do cliente
5. Opção de desativar por cliente específico
6. Template padrão: "Olá {nome}! Obrigado pela visita hoje. Como foi seu {serviço}? Avalie de 1 a 5 ⭐"
7. **Pesquisa NPS mensal:** "De 0 a 10, o quanto você indicaria nosso salão?"
8. Cálculo automático do NPS Score (Promotores - Detratores)
9. Dashboard de NPS com evolução mensal
10. Segmentação automática: Promotores (9-10), Neutros (7-8), Detratores (0-6)
11. Alerta quando NPS cair abaixo de threshold configurado
12. Follow-up automático para Detratores pedindo feedback

---

### Story 6.2: Lembrete de Retorno

**As a** business owner,
**I want** clients to receive a return reminder based on service type,
**so that** they book their next appointment proactively.

**Acceptance Criteria:**
1. Configuração de período de retorno por serviço (ex: corte = 30 dias, coloração = 45 dias)
2. Mensagem automática X dias após último atendimento
3. Mensagem inclui sugestão de agendamento com link/opção rápida
4. Não enviar se cliente já tem agendamento futuro
5. Máximo de 1 lembrete por período
6. Log de lembretes enviados
7. Template: "Oi {nome}! Já faz {dias} dias desde seu último {serviço}. Que tal agendar? 💇"

---

### Story 6.3: Mensagem de Aniversário

**As a** business owner,
**I want** clients to receive a birthday message,
**so that** they feel special and may book an appointment.

**Acceptance Criteria:**
1. Campo de data de nascimento no cadastro do cliente
2. Mensagem automática no dia do aniversário às 9h
3. Opção de incluir desconto/promoção especial
4. Não enviar se cliente está marcado como inativo
5. Template: "Feliz aniversário, {nome}! 🎂 Como presente, preparamos algo especial para você..."

---

### Story 6.4: Reativação de Clientes Inativos

**As a** business owner,
**I want** to automatically reach out to inactive clients,
**so that** I can bring them back.

**Acceptance Criteria:**
1. Cliente considerado inativo se não agendou nos últimos 60 dias (configurável)
2. Campanha automática de reativação após período de inatividade
3. Mensagem personalizável com tom de "sentimos sua falta"
4. Opção de incluir promoção de retorno
5. Máximo de 1 mensagem de reativação por cliente a cada 30 dias
6. Marcar cliente como "não retornado" após 2 tentativas sem resposta
7. Relatório de taxa de reativação
8. Template: "Oi {nome}, sentimos sua falta! ❤️ Faz tempo que não nos vemos. Que tal voltar? Temos novidades!"

---

### Story 6.5: Central de Automações

**As a** business owner,
**I want** to manage all my automated messages in one place,
**so that** I can control what is being sent.

**Acceptance Criteria:**
1. Tela listando todas as automações (pós-atendimento, retorno, aniversário, reativação)
2. Toggle para ativar/desativar cada automação
3. Edição de templates de mensagem
4. Configuração de horários de envio
5. Histórico de mensagens enviadas por automação
6. Métricas: taxa de abertura, taxa de agendamento gerado

---

## Epic 7: Lista de Espera Inteligente

**Goal:** Permitir que clientes entrem em lista de espera quando horário desejado não está disponível, com notificação automática quando liberar.

### Story 7.1: Entrada na Lista de Espera

**As a** client,
**I want** to join a waitlist when my preferred time is not available,
**so that** I can be notified if it opens up.

**Acceptance Criteria:**
1. Quando cliente tenta agendar horário ocupado, bot oferece opção de lista de espera
2. Cliente informa: data desejada, período (manhã/tarde/noite) e serviço
3. Confirmação de entrada na lista via WhatsApp
4. Cliente pode estar em no máximo 3 listas simultaneamente
5. Entrada registrada com timestamp

---

### Story 7.2: Notificação de Vaga Liberada

**As a** client,
**I want** to be notified when a slot opens up,
**so that** I can quickly book it.

**Acceptance Criteria:**
1. Quando agendamento é cancelado, sistema verifica lista de espera para aquele período
2. Notifica primeiro cliente da fila em até 1 minuto
3. Cliente tem 30 minutos para confirmar interesse
4. Se não responder, notifica próximo da fila
5. Mensagem: "Boa notícia, {nome}! Liberou horário {hora} no dia {data}. Deseja agendar? Responda SIM em até 30min!"

---

### Story 7.3: Gestão da Lista de Espera

**As a** business owner,
**I want** to see and manage my waitlist,
**so that** I can understand demand.

**Acceptance Criteria:**
1. Visualização da lista de espera por data
2. Número de pessoas esperando por período
3. Possibilidade de notificar manualmente
4. Remoção de cliente da lista
5. Métricas: taxa de conversão da lista de espera

---

## Epic 8: Multi-Profissional (Equipe)

**Goal:** Suportar salões com múltiplos profissionais, cada um com sua agenda, serviços e comissões próprias.

### Story 8.1: Cadastro de Profissionais

**As a** business owner,
**I want** to add team members to my business,
**so that** clients can book with specific professionals.

**Acceptance Criteria:**
1. CRUD de profissionais (nome, telefone, foto, especialidades)
2. Cada profissional vinculado ao negócio
3. Profissional pode ter acesso próprio ao sistema (login separado)
4. Níveis de acesso: Dono (tudo), Profissional (apenas sua agenda)
5. Ativar/desativar profissional sem deletar
6. Profissional pode ter serviços específicos que oferece

---

### Story 8.2: Agenda por Profissional

**As a** business owner,
**I want** each professional to have their own schedule,
**so that** bookings are organized per person.

**Acceptance Criteria:**
1. Cada profissional com horários de trabalho próprios
2. Visualização de agenda consolidada (todos) ou individual
3. Bloqueios de horário por profissional (folga individual)
4. Cores diferentes para cada profissional na visualização
5. Filtro de agenda por profissional

---

### Story 8.3: Cliente Escolhe Profissional

**As a** client,
**I want** to choose which professional I want to book with,
**so that** I can see my preferred stylist.

**Acceptance Criteria:**
1. Fluxo de agendamento: após escolher serviço, listar profissionais disponíveis
2. Mostrar foto e nome do profissional
3. Opção "sem preferência" para qualquer profissional disponível
4. Horários exibidos são apenas do profissional escolhido
5. Agendamento vinculado ao profissional específico

---

### Story 8.4: Visão do Profissional

**As a** professional,
**I want** to see only my appointments and earnings,
**so that** I can manage my work.

**Acceptance Criteria:**
1. Login próprio do profissional
2. Dashboard mostrando apenas seus agendamentos
3. Visualização de seus ganhos (comissões)
4. Notificações apenas de seus clientes
5. Não pode ver dados de outros profissionais
6. Pode adicionar observações nos seus clientes

---

### Story 8.5: Projeção de Ganhos por Profissional

**As a** professional,
**I want** to see projections of my earnings,
**so that** I can plan my finances and set personal goals.

**Acceptance Criteria:**
1. Projeção de comissões para próximos 7, 15 e 30 dias
2. Baseado em agendamentos confirmados do profissional
3. Histórico de ganhos mensais (gráfico de evolução)
4. Comparativo: mês atual vs mês anterior vs média
5. Meta pessoal de ganhos configurável
6. Indicador visual: quanto falta para atingir a meta
7. Estimativa de atendimentos necessários para meta
8. Simulador: "Se eu fizer X atendimentos por dia, ganho Y"
9. Alerta quando projeção está abaixo da média pessoal
10. Breakdown por tipo de serviço (quais rendem mais)
11. Sugestão de serviços mais lucrativos para oferecer
12. Projeção de ganhos extras (gorjetas, vendas de produtos)
13. Exportação de relatório pessoal de ganhos
14. Visível apenas para o próprio profissional (privacidade)

---

### Story 8.6: Profissional Substituto e Contingência

**As a** business owner,
**I want** to configure backup professionals for each team member,
**so that** clients can be reassigned automatically when someone is unavailable.

**Acceptance Criteria:**
1. Configurar profissional substituto padrão para cada membro
2. Ordem de prioridade de substitutos (1º, 2º, 3º opção)
3. Substituição automática quando profissional marca ausência
4. Notificação ao cliente sobre troca de profissional
5. Cliente pode aceitar ou reagendar após notificação
6. Substituição considera habilidades/serviços compatíveis
7. Alerta se não houver substituto disponível
8. Relatório de substituições realizadas
9. Comissão vai para quem executou o serviço
10. Histórico de ausências por profissional
11. Previsão de impacto: "Se fulano faltar, X agendamentos afetados"
12. Modo emergência: redistribuir agenda do dia automaticamente
13. Integração com lista de espera (oferece vaga para quem esperava)
14. Configuração de antecedência mínima para avisar ausência
15. Penalidade configurável para ausências sem aviso

---

## Epic 9: Controle Financeiro Real

**Goal:** Gestão financeira completa com registro de pagamentos, comissões por profissional, caixa diário e relatórios financeiros.

### Story 9.1: Registro de Pagamento

**As a** business owner,
**I want** to register payments for appointments,
**so that** I have accurate financial records.

**Acceptance Criteria:**
1. Ao marcar agendamento como concluído, opção de registrar pagamento
2. Formas de pagamento: Dinheiro, Pix, Cartão Crédito, Cartão Débito
3. Valor padrão é o preço do serviço, mas editável (desconto)
4. Opção de pagamento parcial
5. Registro de quem recebeu o pagamento
6. Comprovante opcional (foto do recibo)

---

### Story 9.2: Configuração de Comissões

**As a** business owner,
**I want** to configure commission rates per professional,
**so that** payments are calculated automatically.

**Acceptance Criteria:**
1. Percentual de comissão por profissional (ex: 50%)
2. Opção de comissão diferente por serviço
3. Opção de comissão fixa por serviço (em vez de %)
4. Visualização de regras de comissão ativas
5. Histórico de alterações de comissão

---

### Story 9.3: Cálculo Automático de Comissões

**As a** system,
**I want** to automatically calculate commissions,
**so that** professionals know their earnings.

**Acceptance Criteria:**
1. Comissão calculada automaticamente ao registrar pagamento
2. Valor do salão vs valor do profissional exibidos
3. Acúmulo de comissões por período
4. Profissional visualiza suas comissões no app
5. Relatório de comissões pendentes de repasse

---

### Story 9.4: Fechamento de Caixa

**As a** business owner,
**I want** to close the register daily,
**so that** I know how much I earned each day.

**Acceptance Criteria:**
1. Resumo do dia: total recebido por forma de pagamento
2. Breakdown: quanto é do salão vs comissões
3. Comparativo com dia anterior e média
4. Fechamento registra valores finais
5. Histórico de fechamentos
6. Alerta se houver pagamentos pendentes de registro

---

### Story 9.5: Relatório Financeiro

**As a** business owner,
**I want** to see financial reports,
**so that** I understand my business profitability.

**Acceptance Criteria:**
1. Faturamento por período (dia, semana, mês)
2. Breakdown por serviço
3. Breakdown por profissional
4. Breakdown por forma de pagamento
5. Comissões pagas vs a pagar
6. Ticket médio
7. Comparativo com período anterior
8. Exportação para CSV

---

### Story 9.6: Alertas de Custos Elevados

**As a** business owner,
**I want** to receive alerts when costs are unusually high,
**so that** I can control expenses and maintain profitability.

**Acceptance Criteria:**
1. Alerta quando custo de produtos excede X% do faturamento
2. Alerta quando comissões excedem média histórica
3. Comparativo de custos: mês atual vs meses anteriores
4. Identificação de profissionais com custo acima da média
5. Identificação de serviços com margem negativa
6. Notificação via dashboard e/ou WhatsApp
7. Sugestões de ação para redução de custos
8. Relatório mensal de eficiência financeira

---

### Story 9.7: Projeção de Faturamento

**As a** business owner,
**I want** to see revenue projections,
**so that** I can plan ahead and set realistic goals.

**Acceptance Criteria:**
1. Projeção de faturamento para próximos 7, 15 e 30 dias
2. Baseado em agendamentos confirmados + histórico de conversão
3. Projeção de comissões a pagar
4. Cenários: pessimista, realista, otimista
5. Meta vs projeção com indicador visual
6. Alerta se projeção estiver abaixo da meta
7. Sugestões para aumentar faturamento projetado
8. Comparativo: projeção anterior vs realizado (acurácia)
9. Gráfico de tendência de faturamento

---

### Story 9.8: Integração com Gateways de Pagamento

**As a** business owner,
**I want** to accept payments directly through the platform,
**so that** I can offer convenience to clients and automate financial records.

**Acceptance Criteria:**
1. Integração com múltiplos gateways: Stripe, MercadoPago, PagSeguro, Stone
2. Configuração de gateway preferido nas configurações do negócio
3. Suporte a Pix com QR Code gerado automaticamente
4. Suporte a cartão de crédito com parcelamento configurável
5. Suporte a cartão de débito
6. Link de pagamento enviável via WhatsApp após agendamento
7. Pagamento antecipado opcional (sinal/entrada)
8. Webhook de confirmação de pagamento atualiza status automaticamente
9. Conciliação automática: pagamento recebido = registro financeiro criado
10. Taxa do gateway visível e deduzida do faturamento líquido
11. Relatório de taxas pagas por período
12. Suporte a reembolso parcial ou total
13. Split de pagamento automático (comissão do profissional)
14. Fallback para registro manual se gateway indisponível
15. Sandbox/modo teste para configuração inicial

---

## Epic 10: Marketing Básico

**Goal:** Ferramentas de marketing com segmentação de clientes e campanhas automáticas baseadas em comportamento.

### Story 10.1: Segmentação de Clientes

**As a** business owner,
**I want** to segment my clients automatically,
**so that** I can target them with relevant messages.

**Acceptance Criteria:**
1. Segmentos automáticos:
   - VIP: 5+ visitas nos últimos 3 meses
   - Novos: primeira visita nos últimos 30 dias
   - Inativos: sem visita há 60+ dias
   - Recorrentes: 2-4 visitas nos últimos 3 meses
2. Contador de clientes por segmento
3. Visualização de lista por segmento
4. Possibilidade de criar segmentos customizados (futuro)

---

### Story 10.2: Campanhas de Mensagem

**As a** business owner,
**I want** to send campaigns to client segments,
**so that** I can promote services and fill my schedule.

**Acceptance Criteria:**
1. Selecionar segmento-alvo
2. Compor mensagem (texto + emoji)
3. Pré-visualização da mensagem
4. Agendamento de envio (imediato ou data/hora)
5. Confirmação de quantidade de destinatários
6. Rate limiting: máximo 100 mensagens/hora
7. Registro de campanha enviada

---

### Story 10.3: Campanhas para Horários Ociosos

**As a** business owner,
**I want** to promote empty slots,
**so that** I can fill my schedule.

**Acceptance Criteria:**
1. Sistema identifica horários sem agendamento nos próximos 3 dias
2. Sugestão de campanha: "Horário disponível amanhã às X, promoção de Y%"
3. Envio para clientes que agendaram serviço similar antes
4. Desconto aplicado automaticamente se cliente agendar pelo link
5. Métricas: slots preenchidos via campanha

---

### Story 10.4: Métricas de Marketing

**As a** business owner,
**I want** to see if my campaigns worked,
**so that** I can improve future ones.

**Acceptance Criteria:**
1. Lista de campanhas enviadas
2. Por campanha: enviadas, respondidas, agendamentos gerados
3. Taxa de conversão (agendamentos / enviadas)
4. Melhor campanha do mês
5. ROI estimado (faturamento gerado vs custo de mensagens)

---

### Story 10.5: Sugestões Inteligentes de Promoções (IA)

**As a** business owner,
**I want** the system to suggest promotions based on data,
**so that** I can optimize my marketing without manual analysis.

**Acceptance Criteria:**
1. IA analisa padrões de agendamento e identifica oportunidades
2. Sugestões automáticas: "Terças têm 40% menos agendamentos, considere promoção"
3. Identificação de serviços com baixa demanda
4. Sugestão de desconto ideal baseado em histórico
5. Previsão de impacto da promoção
6. Notificação push/WhatsApp para o dono com sugestões semanais

---

### Story 10.6: Templates de Conteúdo

**As a** business owner,
**I want** ready-made content templates,
**so that** I can post on social media without effort.

**Acceptance Criteria:**
1. Biblioteca de templates para Stories Instagram
2. Templates para posts de Facebook/Instagram
3. Templates de mensagens WhatsApp sazonais
4. Personalização automática com nome do salão e cores
5. Calendário de datas comemorativas com sugestões
6. Download em formatos adequados para cada rede

---

### Story 10.7: Marketing por Profissional

**As a** professional,
**I want** my own marketing link and tracking,
**so that** I can attract and retain my own clients.

**Acceptance Criteria:**
1. Link único de agendamento por profissional
2. QR Code personalizado para divulgação
3. Rastreamento de clientes captados por profissional
4. Comissão bônus para clientes captados (configurável)
5. Relatório de performance de captação
6. Ranking de profissionais por novos clientes

---

### Story 10.8: Previsão de Demanda com IA

**As a** business owner,
**I want** the system to predict demand for each time slot,
**so that** I can optimize staffing and promotions.

**Acceptance Criteria:**
1. IA analisa histórico de 6+ meses de agendamentos
2. Previsão de demanda por dia da semana e horário
3. Previsão de demanda por tipo de serviço
4. Identificação de tendências (crescimento/queda)
5. Previsão de faturamento baseada em demanda
6. Sugestão de horários para promoções
7. Sugestão de profissionais necessários por período
8. Alerta de períodos com demanda acima da capacidade
9. Acurácia da previsão exibida e melhorada com feedback
10. Exportação de previsões para planejamento

---

### Story 10.9: Recomendação Personalizada de Serviços

**As a** business owner,
**I want** the system to recommend services to clients,
**so that** I can increase ticket médio and client satisfaction.

**Acceptance Criteria:**
1. IA analisa histórico de serviços do cliente
2. Recomendação de serviços complementares (ex: corte + hidratação)
3. Recomendação baseada em tempo desde último serviço
4. Sugestões personalizadas via WhatsApp
5. Timing inteligente (não enviar após serviço recente)
6. Opção de incluir desconto na recomendação
7. Métricas: taxa de conversão de recomendações
8. A/B testing de mensagens de recomendação
9. Configuração de quais serviços recomendar para cada perfil
10. Machine learning para melhorar recomendações com o tempo

---

## Epic 11: Programa de Fidelidade

**Goal:** Sistema de pontos e recompensas para fidelização de clientes, com níveis, benefícios automáticos e cashback.

### Story 11.1: Sistema de Pontos

**As a** client,
**I want** to earn points for each visit,
**so that** I can exchange them for rewards.

**Acceptance Criteria:**
1. Pontos gerados automaticamente ao completar agendamento
2. Regra padrão: 1 ponto para cada R$1 gasto
3. Regras customizáveis pelo dono (multiplicadores por serviço)
4. Saldo de pontos visível para cliente via WhatsApp
5. Extrato de pontos ganhos e utilizados
6. Pontos expiram após 12 meses sem movimentação

---

### Story 11.2: Níveis de Fidelidade

**As a** business owner,
**I want** to reward my best clients with VIP status,
**so that** they feel special and keep coming back.

**Acceptance Criteria:**
1. Níveis automáticos: Bronze (0-99 pts), Prata (100-499 pts), Ouro (500-999 pts), Diamante (1000+ pts)
2. Benefícios por nível configuráveis
3. Notificação ao cliente quando sobe de nível
4. Badge visual no perfil do cliente
5. Prioridade na lista de espera para níveis altos
6. Desconto automático por nível (ex: Diamante = 10% off)

---

### Story 11.3: Resgate de Recompensas

**As a** client,
**I want** to redeem my points for rewards,
**so that** I get value from my loyalty.

**Acceptance Criteria:**
1. Catálogo de recompensas configurável pelo dono
2. Tipos de recompensa: desconto %, desconto R$, serviço grátis, produto
3. Resgate via WhatsApp ou app
4. Cupom gerado automaticamente após resgate
5. Validade do cupom configurável
6. Histórico de resgates

---

### Story 11.4: Cashback Automático

**As a** business owner,
**I want** to offer cashback instead of points,
**so that** I can provide a simpler reward system.

**Acceptance Criteria:**
1. Opção de ativar cashback em vez de pontos
2. Percentual de cashback configurável (ex: 5%)
3. Cashback creditado após 7 dias do atendimento
4. Saldo de cashback visível para cliente
5. Uso automático no próximo agendamento
6. Opção de uso parcial do saldo

---

### Story 11.5: Painel de Fidelidade

**As a** business owner,
**I want** to see loyalty program performance,
**so that** I can optimize rewards.

**Acceptance Criteria:**
1. Dashboard com métricas do programa
2. Pontos emitidos vs resgatados
3. Distribuição de clientes por nível
4. Taxa de retorno de clientes no programa
5. ROI do programa de fidelidade
6. Clientes próximos de subir de nível

---

## Epic 12: Controle de Estoque

**Goal:** Gestão de produtos e insumos vinculados aos serviços, com alertas de reposição e controle de custos.

### Story 12.1: Cadastro de Produtos

**As a** business owner,
**I want** to register products and supplies,
**so that** I can track my inventory.

**Acceptance Criteria:**
1. CRUD de produtos (nome, marca, categoria, unidade)
2. Preço de custo e preço de venda
3. Estoque mínimo para alerta
4. Foto do produto (opcional)
5. Código de barras/SKU
6. Categorias: Revenda, Uso interno, Ambos

---

### Story 12.2: Movimentação de Estoque

**As a** business owner,
**I want** to track stock movements,
**so that** I know where products are going.

**Acceptance Criteria:**
1. Entrada de estoque (compra, devolução)
2. Saída de estoque (uso em serviço, venda, perda)
3. Histórico de movimentações por produto
4. Quem fez a movimentação e quando
5. Ajuste de inventário manual
6. Relatório de movimentações por período

---

### Story 12.3: Vinculação Produto-Serviço

**As a** business owner,
**I want** products to be linked to services,
**so that** stock is automatically deducted.

**Acceptance Criteria:**
1. Configurar produtos usados por serviço
2. Quantidade média de uso por serviço
3. Baixa automática de estoque ao completar agendamento
4. Custo do serviço calculado (produtos + comissão)
5. Alerta se produto vinculado está em falta
6. Margem de lucro real por serviço

---

### Story 12.4: Alertas de Estoque

**As a** business owner,
**I want** to be alerted when stock is low,
**so that** I can reorder in time.

**Acceptance Criteria:**
1. Alerta quando produto atinge estoque mínimo
2. Notificação via WhatsApp e/ou dashboard
3. Lista de produtos para reposição
4. Sugestão de quantidade baseada em consumo médio
5. Alerta de produtos próximos do vencimento
6. Relatório de produtos parados (sem movimento)

---

### Story 12.5: Relatórios de Estoque

**As a** business owner,
**I want** inventory reports,
**so that** I can manage costs.

**Acceptance Criteria:**
1. Valor total do estoque atual
2. Produtos mais consumidos
3. Custo de produtos por período
4. Comparativo custo vs faturamento
5. Produtos com maior giro
6. Exportação para CSV

---

## Epic 13: Perfil Profissional & Gamificação

**Goal:** Mini-site público para cada profissional, sistema de avaliações, metas e ranking para motivação da equipe.

### Story 13.1: Perfil Público do Profissional

**As a** professional,
**I want** my own public profile page,
**so that** clients can learn about me and book directly.

**Acceptance Criteria:**
1. URL única por profissional (bela360.com/p/nome)
2. Foto, bio, especialidades
3. Galeria de trabalhos (portfólio)
4. Avaliação média e número de atendimentos
5. Serviços oferecidos com preços
6. Botão de agendamento direto via WhatsApp
7. Links para redes sociais

---

### Story 13.2: Sistema de Avaliações

**As a** client,
**I want** to rate my professional after the appointment,
**so that** others can see their quality.

**Acceptance Criteria:**
1. Avaliação de 1-5 estrelas após atendimento
2. Comentário opcional
3. Avaliação vinculada ao profissional específico
4. Média calculada automaticamente
5. Avaliações visíveis no perfil público
6. Profissional pode responder avaliações
7. Filtro de avaliações por nota

---

### Story 13.3: Metas e Objetivos

**As a** business owner,
**I want** to set goals for my team,
**so that** they stay motivated.

**Acceptance Criteria:**
1. Definir metas mensais por profissional
2. Tipos de meta: faturamento, atendimentos, novos clientes, avaliação média
3. Acompanhamento visual do progresso
4. Notificação de meta atingida
5. Histórico de metas cumpridas
6. Bonificação automática por meta (opcional)

---

### Story 13.4: Ranking da Equipe

**As a** professional,
**I want** to see how I compare to colleagues,
**so that** I can improve my performance.

**Acceptance Criteria:**
1. Ranking mensal de profissionais
2. Critérios: faturamento, atendimentos, avaliação, taxa de retorno
3. Pódio visual (1º, 2º, 3º lugar)
4. Prêmio configurável para top performers
5. Ranking visível apenas para a equipe
6. Histórico de rankings anteriores

---

### Story 13.5: Conquistas e Badges

**As a** professional,
**I want** to earn badges for achievements,
**so that** I feel recognized for my work.

**Acceptance Criteria:**
1. Badges automáticos: "100 atendimentos", "5 estrelas", "Cliente fiel", etc.
2. Badge especial por tempo de casa
3. Badge por meta batida consecutivamente
4. Exibição no perfil do profissional
5. Notificação de nova conquista
6. Compartilhamento em redes sociais

---

### Story 13.6: Painel do Profissional Completo

**As a** professional,
**I want** a complete dashboard of my performance,
**so that** I can track my growth.

**Acceptance Criteria:**
1. Resumo: atendimentos, faturamento, comissão do mês
2. Gráfico de evolução mensal
3. Minha posição no ranking
4. Próxima meta e quanto falta
5. Minhas conquistas/badges
6. Meus clientes fiéis (top 10)
7. Agenda da semana

---

## Epic 14: Ecossistema e Marketplace

**Goal:** Criar um ecossistema completo além do software, com marketplace de produtos, educação e comunidade para gerar valor contínuo e receita adicional.

### Story 14.1: Marketplace de Produtos

**As a** business owner,
**I want** to buy professional products directly through the platform,
**so that** I can save time and get better prices.

**Acceptance Criteria:**
1. Catálogo de produtos profissionais de marcas parceiras
2. Integração com estoque do salão (Epic 12)
3. Preços especiais para usuários da plataforma
4. Pedido com entrega rastreada
5. Histórico de compras
6. Sugestão de produtos baseada em consumo
7. Avaliações de produtos por outros salões
8. Parcelamento e múltiplas formas de pagamento
9. Comissão para Bela360 por venda (modelo de negócio)

---

### Story 14.2: Cursos e Treinamentos

**As a** professional,
**I want** to access training courses,
**so that** I can improve my skills and services.

**Acceptance Criteria:**
1. Biblioteca de cursos em vídeo
2. Categorias: técnicas, gestão, atendimento, marketing
3. Cursos gratuitos e pagos
4. Certificados de conclusão
5. Progresso salvo por profissional
6. Cursos recomendados baseado em avaliações recebidas
7. Parceria com academias e escolas de beleza
8. Integração com badges/conquistas (Epic 13)
9. Desconto em cursos para assinantes premium

---

### Story 14.3: Comunidade de Profissionais

**As a** professional,
**I want** to connect with other beauty professionals,
**so that** I can learn, share and grow my network.

**Acceptance Criteria:**
1. Fórum de discussão por categoria
2. Grupos regionais
3. Perguntas e respostas moderadas
4. Compartilhamento de trabalhos (portfólio)
5. Eventos e encontros presenciais
6. Mentoria entre profissionais
7. Ranking de contribuição na comunidade
8. Ofertas de emprego e parcerias
9. Lives e webinars com especialistas

---

### Story 14.4: Parcerias com Marcas

**As a** business owner,
**I want** access to exclusive brand partnerships,
**so that** I can offer better products and get perks.

**Acceptance Criteria:**
1. Programa de parceria com marcas de beleza
2. Descontos exclusivos para salões parceiros
3. Amostras e lançamentos antecipados
4. Material de marketing das marcas
5. Treinamentos patrocinados
6. Certificações de marca
7. Selo de "Salão Parceiro [Marca]"
8. Comissão por indicação de outros salões

---

### Story 14.5: White Label Premium

**As a** business owner,
**I want** to have my own branded app,
**so that** my salon looks professional and clients book directly with me.

**Acceptance Criteria:**
1. App PWA com marca do salão (logo, cores)
2. URL personalizada (meusalao.bela360.com)
3. Remoção da marca Bela360 (opcional premium)
4. Push notifications com marca do salão
5. QR Code personalizado para clientes
6. Página de download do app
7. Configuração de temas e cores
8. Disponível apenas para planos Business+

---

## Checklist Results Report

*A ser preenchido após execução do checklist PM.*

---

## Next Steps

### UX Expert Prompt

> Revise o PRD do bela360 e crie wireframes de baixa fidelidade para as Core Screens definidas. Foque em mobile-first e fluxos de no máximo 3 toques para ações principais. Considere as limitações de usuários com baixa familiaridade tecnológica.

### Architect Prompt

> Com base neste PRD, crie a arquitetura técnica do bela360. Defina: estrutura do monorepo, schema do banco de dados, design de APIs, integração WhatsApp, e infraestrutura. Priorize free tiers e simplicidade para MVP.
