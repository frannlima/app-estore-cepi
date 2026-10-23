# Central de Chamadas Automáticas — CE+PI

Status: especificação técnica; NÃO habilitada em produção. Nenhuma chamada deverá ser efetuada até configuração de credenciais, número originador e autorização explícita do administrador.

## Escopo
Uma central única de alertas de voz para `app-estore-cepi` e `meu-acompanhamento`. O backend Supabase compartilha cadastro de lojas, responsáveis, pendências e tentativas; cada app alimenta eventos de venda do respectivo indicador (eStore ou Flash). IDs de filial e indicador compõem a chave lógica. Não misturar valores de Flash e eStore; share = venda eStore / venda Flash compatíveis em loja, data e janela temporal.

## Gatilhos configuráveis (fuso America/Fortaleza)
- A partir das 14:00 verificar duas parciais consecutivas sem atualização, com intervalos e cronograma definidos na configuração operacional.
- Primeiro enviar alerta por WhatsApp pela central já existente.
- Após 30 minutos sem atualização, enfileirar chamada de voz ao contato responsável ativo. Necessária autorização do administrador para ativar o modo automático.
- Não ligar se houve atualização válida no intervalo, contato em folga/férias, telefone inválido, tentativa prévia em andamento ou silenciamento.
- Máximo de 2 tentativas por filial/indicador/dia; intervalo mínimo de 60 minutos entre tentativas. Limitar concorrência e custo diário. Nunca fazer retry indiscriminado.
- Após 21:00, encerrar novos disparos; pendências de fechamento ficam disponíveis para revisão, sem ligação fora do horário.
- Permitir pausa global, pausa por loja e opt-out/sem contato; só responsáveis corporativos autorizados, com ciência da finalidade.
- Lojas permitidas: 073,084,108,113,138,142,146,175,177,222,238,258,262,314,318,344,350,552. Excluir 089,090,109.

## Integração de telefonia
Twilio Programmable Voice REST API exclusivamente no backend (Supabase Edge Function/worker autenticado); credenciais em Secrets, nunca no front-end nem no GitHub. Utilizar número de origem apto a chamadas ao Brasil, conforme regras e elegibilidade atuais da Twilio e operadoras. Para Brasil, não contar com caller ID de número brasileiro de outra operadora. Configurar URLs HTTPS para TwiML `<Say language="pt-BR">` (validar disponibilidade de voz) e status callbacks. Assinar/verificar callbacks do provedor, correlacionar CallSid e idempotency_key. Não gravar áudio por padrão.

## Esquema mínimo sugerido (RLS no Supabase)
- `voice_settings`: org_id, enabled=false, timezone, start_at, end_at, grace_minutes, max_attempts, min_retry_minutes, max_calls_per_day, max_daily_cost, updated_by.
- `voice_contacts`: id, store_id, employee_id, display_name, e164_phone (restrito), active, absence_until, opt_out, consent_or_notice_at.
- `voice_alert_cases`: id, store_id, metric (flash/estore), business_date, last_input_at, missed_partials, whatsapp_alert_at, pending, resolved_at, dedupe_key UNIQUE.
- `voice_call_attempts`: id, case_id, contact_id, scheduled_at, started_at, ended_at, provider, provider_call_id UNIQUE, status, duration_seconds, cost_estimate, error_code, idempotency_key UNIQUE, initiated_by.
- `voice_audit`: actor, action, case_id, created_at, details sem segredos.

Restrinja leitura de telefones aos perfis autorizados. O papel de administrador deve ser validado no servidor, jamais apenas por matrícula fornecida pelo navegador. Não registrar credenciais nem números completos em logs. Políticas de retenção e acesso compatíveis com LGPD.

## API/fluxo
1. `POST /sales-events`: input validado por loja, indicador, janela e fonte, com evento idempotente (sem somar snapshots repetidos).
2. `POST /voice/reconcile`: cron autenticado checa atraso do Flash/eStore, abre/resolve casos e evita disparos duplicados.
3. `POST /voice/dispatch`: worker exclusivo valida regras e faz solicitação à API do provedor; indisponibilidade mantém fila segura.
4. `POST /voice/status`: webhook verificado atualiza tentativa (queued/ringing/in-progress/completed/no-answer/busy/failed).
5. `GET /voice/dashboard`: resumo por loja, indicador, horário, última parcial, WhatsApp, tentativas e status.
6. `POST /voice/pause`: pause/retome para administrador, com trilha de auditoria.

Mensagem sugerida: “Olá. Esta é uma chamada automática da Central de Acompanhamento CE mais PI. Identificamos que a filial {loja} está com atualização pendente do indicador {indicador}. Por favor, registre a parcial no aplicativo. Obrigado.”

## Interface
No eStore CE+PI, módulo Central de Chamadas no Administrativo, com modo de teste, habilitação explícita, custo e histórico. No Meu Acompanhamento, mostrar a visão correspondente à atualização Flash, reutilizando a mesma central; não duplicar backend. Cards com status, última parcial, próxima ação, hora da tentativa, erros, pausar/retomar e ligação manual opcional.

## Critérios de aceite
- 1 caso pendente para a mesma loja+indicador+dia+janela mesmo após importações repetidas.
- Snapshot do Flash alimenta denominador do share somente se mesmo período e filial; sem duplicação.
- Atualização antes do envio cancela a tentativa agendada.
- Empresa provedora rejeita número: erro visível, sem loop de retentativas.
- Nunca ligar fora da janela, acima dos limites ou a contatos suspensos.
- Testar em sandbox com telefones autorizados antes de habilitar produção.

## Pendências para ativar
Conta e provisionamento do provedor; número de saída compatível com Brasil; credenciais Supabase; definição dos contatos finais, ciência/autorizações e teto financeiro; escolha de cronograma real das parciais, testes de voz PT-BR e validação por administrador.
