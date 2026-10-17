# Radar de Alertas eStore CE+PI

Implementação operacional: 16/10/2026.

## Objetivo
Identificar lojas sem alimentação de vendas, com captação zerada ou com atualização atrasada após **duas verificações horárias consecutivas**, iniciando o monitoramento às 12h (horário de Fortaleza).

## Execução no Supabase
Projeto: `fndkjgveeojlywkdrtxe`.
- SQL function: `public.estore_run_alert_monitor(p_at, p_dry_run)`.
- Cron: `estore_cepi_two_partials_monitor_v1`, `5 15-23,0 * * *` (UTC), correspondente a **12h05 até 21h05 em Fortaleza**.
- Primeiro disparo potencial: **13h05**, caso 12h05 e 13h05 confirmem pendência.
- Lojas de rua (084, 113 e 146): última avaliação às **17h05**.
- Lojas com **meta eStore explicitamente zerada** no cadastro diário são ignoradas no dia, inclusive domingos sem operação prevista.
- Lojas monitoradas: 073, 084, 108, 113, 138, 142, 146, 175, 177, 222, 238, 258, 262, 314, 318, 344, 350 e 552.
- Excluídas: 089, 090, 109.
- Fonte de dados: `public.hourly_estore` com exclusão de lançamentos apagados.
- Status: `sem_alimentacao`, `zerada`, `atrasada`, `regular`.
- Atualização considerada atrasada quando o último registro válido ultrapassa 70 minutos.
- Incidentes únicos por episódio; alertas desativados na regularização.
- Destinatários no aplicativo: perfis `supervisor`/`gerente` identificados por matrícula; supervisores com situação 'Atividade Normal' e exceção validada da gerente Rebeca (108).
- Se não houver nenhum destinatário elegível para uma loja (atualmente filial 113), a ocorrência é direcionada somente ao administrador regional para evitar perda do alerta.
- Canal inicial: `notification_messages` com `target_type='matricula'`. A caixa de notificações já existente no app consome essa tabela via `estore-api`.
- Não envia mensagens de WhatsApp, SMS ou push em segundo plano nesta fase.

## Estruturas criadas
- `estore_alert_config`: chave de ativação, horários, tolerância, WhatsApp desligado.
- `estore_alert_checks`: snapshots por loja e hora.
- `estore_alert_incidents`: ocorrências abertas/resolvidas.
- `estore_alert_wa_contacts`: contatos, verificação de telefones e consentimento para integração oficial futura.
- `estore_alert_wa_outbox`: estrutura de fila futura (inativa).
- Tabelas protegidas por RLS, sem acesso direto de clientes anon/authenticated.

## Testes / Operação
- Teste reversível com verificações 12h05 e 13h05 simulou 18 ocorrências e 42 notificações direcionadas (incluindo uma escalada ao administrador para a 113); repetição do mesmo horário não gerou duplicidade. Transação revertida, sem envios reais.
- Dry-run: `select public.estore_run_alert_monitor(now(),true);`
- Verificar job: `select jobid,active,schedule from cron.job where jobname='estore_cepi_two_partials_monitor_v1';`
- Verificar pendências: `select * from public.estore_alert_incidents order by opened_at desc limit 30;`
- Desativar: `update public.estore_alert_config set enabled=false,updated_at=now() where id=1;`
- WhatsApp só deve ser ativado após cadastro validado, consentimento documentado, templates aprovados e provedor oficial configurado.

## Atenção cadastral
A base `collaborators` ainda não apresenta todos os gerentes da regional; somente um gerente está cadastrado como perfil 'gerente' (108), com situação 'Inativo'. O alerta interno foi habilitado também para essa matrícula validada. A cobertura dos demais gerentes no app depende de suas matrículas/perfis corretos; **não assumir que números de telefone exportados do WhatsApp são matrículas**.

## Integração oficial do WhatsApp — estrutura preparada em 16/10/2026

**Estado de produção:** envio WhatsApp desativado até existir conta da Meta autorizada, template aprovado, consentimento e cadastro de contatos. O monitoramento e os alertas internos permanecem ativos.

### Arquitetura implantada
1. O monitoramento identifica duas parciais consecutivas sem vendas ou atualização e abre `estore_alert_incidents`.
2. Um trigger chama `estore_queue_whatsapp_incident`; são enfileirados apenas contatos `enabled=true`, com telefone validado e `opt_in_at` registrado, quando `whatsapp_enabled=true`.
3. A rotina `estore_cepi_whatsapp_dispatch_v1` dispara às **12h10–21h10, Fortaleza** (UTC: `10 15-23,0 * * *`), ou seja, cinco minutos após as verificações horárias.
4. A rotina chama `estore_schedule_whatsapp_dispatch()` que só faz requisição se a chave de serviço estiver no Supabase Vault sob o nome `estore_cepi_dispatch_service_key`.
5. A Edge Function `estore-whatsapp-alerts` (com JWT obrigatório e verificação adicional da chave de serviço) consulta a fila, obtém os destinatários elegíveis e envia um template pela **Meta Cloud API v26.0**.
6. O resultado é auditado em `estore_alert_wa_outbox` com status `sent`, `failed` ou `sending`. Nesse dispatcher legado, `sent` significa aceitação HTTP pela Meta, sem confirmar entrega ao aparelho. Não há reenvio automático após resultado incerto, para prevenir duplicidades.

### Pré-requisitos para habilitação
- Ter permissão legítima da organização para uso da identidade e do número corporativo no envio de alertas operacionais.
- Uma conta WhatsApp Business Platform vinculada à Meta, número de remetente registrado e token de integração com permissão `whatsapp_business_messaging`.
- Um modelo de mensagem aprovado pela Meta no idioma `pt_BR` com nome **`estore_cepi_alerta_parcial`** e exatamente três parâmetros de corpo, na ordem: loja, situação e horário de identificação.
- A título de sugestão de texto para aprovação do template:

  `*Alerta eStore CE+PI* | Loja {{1}}. Situação: {{2}}. Verificação: {{3}}. Após duas parciais consecutivas, a filial permanece em atenção. Verifiquem a captação e o preenchimento do Hora a Hora. Havendo impedimentos, sinalizem a regional para alinhamento das tratativas.`

- Configurar em **Supabase > Project Settings > Edge Functions > Secrets**: `WA_META_ACCESS_TOKEN` e `WA_META_PHONE_NUMBER_ID`. Opcional `WA_META_GRAPH_VERSION=v26.0`. Não armazenar tokens no GitHub nem em conversas.
- Criar no **Supabase Vault** o segredo `estore_cepi_dispatch_service_key` com o valor da chave de serviço do projeto Supabase, para autorizar a Edge Function chamada pelo Cron. Não publicar a chave em código.
- Registrar contatos em `estore_alert_wa_contacts`, com `store_code`, `nome`, `matricula`, `cargo`, `phone_e164`, `validated_at`, `opt_in_at`, `enabled`. Não importar os contatos do grupo como consentimentos automáticos.
- Fazer envio-piloto consentido e revisar status com a Meta; após teste efetivo, definir `estore_alert_config.whatsapp_enabled=true`.

### Segurança / desativação
- Para suspender apenas WhatsApp, sem interromper notificações internas:
  `update public.estore_alert_config set whatsapp_enabled=false where id=1;`
- Filiais 089, 090 e 109 não estão no escopo de monitoramento.
- O sistema envia aos indivíduos por **mensagem direta**, não ao grupo do WhatsApp.
- Observação: a aprovação do modelo e a atribuição de categoria/preço dependem da Meta.

## Piloto individual com confirmação de entrega — 17/10/2026

### Diagnóstico confirmado

- `estore_alert_config.whatsapp_enabled=false`; fila regional vazia.
- A chave `estore_cepi_dispatch_service_key` ainda não está no Vault. Portanto, o agendamento regional não chama o provedor.
- O sender original não recebia callbacks de entrega. Aceitação de uma chamada no painel Meta não comprova recebimento no WhatsApp.
- O erro exato do teste anterior, feito diretamente no painel Meta, depende da consulta ao payload `statuses[].errors[]` daquele evento. Ele não foi criado no Supabase e não possui registro de teste para correlação automática.

### Estrutura implantada

- `estore-whatsapp-test`: JWT obrigatório mais validação da chave de serviço no handler. Aceita apenas `action` e `request_id`; não aceita destinatários fornecidos pelo cliente.
- `estore-whatsapp-webhook`: autenticação por HMAC SHA-256 (`X-Hub-Signature-256`), conferida sobre o corpo original com `WA_META_APP_SECRET`. O GET da verificação usa `WA_WEBHOOK_VERIFY_TOKEN`.
- `estore_whatsapp_test_config`: um contato autorizado, telefone esperado e chave de habilitação do teste manual. A configuração e o telefone permanecem exclusivamente no banco protegido.
- `estore_whatsapp_tests`: tentativa, identificação retornada pela Meta, estado de entrega e erros.
- `estore_whatsapp_test_events`: histórico idempotente dos status associados à tentativa autorizada. Mensagens recebidas, conteúdo de conversas e contatos de terceiros não são armazenados.
- Tabelas com RLS e privilégios revogados para `anon` e `authenticated`; RPCs com `SECURITY INVOKER`, exclusivas do backend.
- O modo de teste exige que o canal regional permaneça desligado. Não consome a fila de incidentes, não importa a lista de contatos em revisão e não modifica os cron jobs.
- No máximo uma nova tentativa por minuto. Repetir o mesmo UUID retorna a tentativa existente, sem reenviar. Resultado de rede incerto exige reconciliação manual.

### Configuração que depende do painel Meta

1. Entrar na conta que possui o app **eStore CE+PI Alertas**. Conta Meta gerenciada é uma modalidade distinta do login pelo Facebook.
2. Conferir o número remetente de teste, seu **Phone Number ID** e a conta WABA vinculada. O ID do telefone não é o número visível do remetente.
3. Conferir e validar somente o destinatário autorizado do piloto na lista de destinatários de teste da Meta. Não adicionar os contatos em revisão.
4. Cadastrar exclusivamente em **Supabase > Edge Functions > Secrets**:
   - `WA_META_ACCESS_TOKEN`: token válido do mesmo app/WABA, com permissão de envio.
   - `WA_META_PHONE_NUMBER_ID`: ID numérico do remetente.
   - `WA_META_APP_SECRET`: App Secret usado para autenticar os callbacks.
   - `WA_WEBHOOK_VERIFY_TOKEN`: valor aleatório com pelo menos 24 caracteres, igual ao usado na verificação do callback.
   - Opcional: `WA_META_GRAPH_VERSION`; o padrão mantém `v26.0` do dispatcher existente.
5. Callback: `https://fndkjgveeojlywkdrtxe.supabase.co/functions/v1/estore-whatsapp-webhook`. Configurar assinatura do campo `messages` e conferir a assinatura do app na WABA (`subscribed_apps`).
6. Consultar `estore-whatsapp-test` com `{"action":"diagnostics"}` por um backend autorizado. Só enviar quando `ready=true`.
7. Fazer uma única chamada `{"action":"send_test","request_id":"<UUID novo>"}`. A mensagem é o modelo oficial de teste `hello_world`, idioma `en_US`, sem dados operacionais.
8. Consultar `{"action":"result","request_id":"<mesmo UUID>"}`. `accepted` significa somente aceitação; `delivered` confirma entrega e `read` confirma leitura quando disponível. `failed` inclui o código e os detalhes recebidos da Meta.

Não incluir tokens em conversas, código, PRs ou URLs. Não habilitar `whatsapp_enabled` durante este piloto. O endpoint de callback retorna 503 enquanto os segredos necessários estiverem ausentes, em vez de aceitar eventos sem autenticação.

### Validação realizada

- `node --test supabase/tests/whatsapp-test.test.mjs`: 15 testes, incluindo bloqueio de outro destinatário, falta de consentimento, autenticação, erros Meta, idempotência e resultados incertos.
- `supabase/tests/whatsapp-test.sql`: validação no banco dentro de transação revertida; cobre limites, destinatário/remetente incorretos, status fora de ordem e deduplicação. Não chama a Meta.
- Endpoint de teste sem autenticação: 401. Callback sem configuração: 503. Nenhuma mensagem real foi enviada na implantação.
- Advisor informa RLS sem políticas nas tabelas privadas; isso corresponde à negação de acesso de clientes por padrão. Não adicionar políticas públicas para remover esse aviso. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy.

### Referências técnicas

- Modelo oficial de teste e assinatura do app na WABA: https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api
- Autenticação de Edge Functions: https://supabase.com/docs/guides/functions/auth-headers
- Verificação de callback e assinatura HMAC da Meta: https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/ (referência de protocolo; o SDK arquivado não é dependência desta implementação).


## Especificação pendente: confirmação de folga, férias e jornada via WhatsApp (17/10/2026)

**Status: especificação da próxima fase; ainda não implementada nos webhooks ou no disparador. Manter `estore_alert_config.whatsapp_enabled=false` e o PR em rascunho enquanto o teste individual de entrega não for confirmado.**

### Jornada e elegibilidade
- Gerentes: de segunda a sábado, **limite de alertas 12h00–16h30**; a jornada informada termina às 17h00, respeitar afastamentos e folgas.
- Supervisores: janela de referência **14h00–21h00**, limitada pelo funcionamento da loja e pela jornada individual efetiva. Não pressupor que qualquer supervisor esteja trabalhando das 14h às 21h.
- Como não há acesso ao registro oficial de escalas, permitir que o próprio supervisor responda pelo WhatsApp; a confirmação de disponibilidade deve ser voluntária e baseada em consentimento.
- Não gerar mensagens operacionais até o supervisor confirmar que está **em jornada** e informar sua hora de saída naquele dia. Sem confirmação, a ocorrência fica no painel interno; não distribuir a outro número que não esteja elegível.
- O primeiro contato é, no máximo, um pedido **neutro e facultativo** de confirmação de disponibilidade, sem cobrança ou números de resultado; observar o risco de contato em folga, evitar insistência e alinhar previamente com RH/compliance. Nenhum trabalho ou resposta deve ser exigido fora da jornada.

### Fluxo WhatsApp sugerido
Usar template aprovado pela Meta com quick replies e processamento de inbound webhook assinado (não confundir com o webhook de status de entrega já existente). Mensagem inicial sugerida:
> Olá! Este canal pode enviar avisos operacionais eStore durante sua jornada. Caso esteja trabalhando e queira recebê-los hoje, confirme sua disponibilidade. Se estiver em folga ou férias, informe abaixo. Não é necessário responder fora do expediente.

Botões:
- **Em jornada** (payload `ESTORE_WORKING`): solicitar saída `HH:MM`, armazenar a confirmação para o dia e limitar o envio ao menor horário entre fim informado, término da janela do cargo e horário operacional da filial; opcionalmente aplicar margem de 30 minutos.
- **Folga hoje** (payload `ESTORE_DAY_OFF`): silenciar os alertas individuais para o restante do dia local, sem reagendamento retroativo; no dia seguinte, não pressupor jornada automaticamente.
- **Estou de férias** (payload `ESTORE_VACATION`): bloquear imediatamente e perguntar **data de retorno DD/MM/AAAA**; enquanto estiver aguardando a data, manter o bloqueio. Validar formato e data futura e registrar `suspended_until`. Na data de retorno, liberar apenas a possibilidade de nova confirmação de jornada; não reenviar automaticamente alertas antigos.

### Regras técnicas e proteção
1. Relacionar resposta ao cadastro previamente validado por `wa_id`/telefone E.164, matrícula e filial; **nunca** usar mensagem de terceiros para alterar disponibilidade de outro destinatário.
2. Idempotência por `wamid` de entrada, verificação da assinatura HMAC do webhook da Meta e auditoria de alteração de estado, mantendo mínimo de dados necessários.
3. Quando `folga`, `ferias`, `aguardando_data_retorno`, `sem_confirmacao` ou `jornada_encerrada`: **bloquear no backend a criação e, novamente, o envio**; remover/cancelar itens pendentes para não enviar após mudança de status.
4. Estado `Em jornada` deve expirar automaticamente na saída informada ou ao final do dia, o que ocorrer primeiro. Alterações de escala e jornadas podem ser atualizadas pelo próprio destinatário durante o expediente.
5. Nunca enviar mensagens atrasadas no dia seguinte ou durante férias. A primeira mensagem de disponibilidade não pode ser usada como justificativa para cobrança fora da jornada.
6. As regras acima **não têm implementação de produção ainda**; exigir testes automatizados com casos de folga, férias com data, retorno, ausência de resposta, entrega fora da janela, fins de semana e lojas de rua, antes de habilitar envios regionais.


## Regra confirmada: gerentes excluídos dos alertas por WhatsApp (17/10/2026)

A partir desta definição, **somente colaboradores cadastrados com `profile_type='supervisor'`, matrícula correspondente à filial e situação `Atividade Normal` podem ser destinatários dos alertas automáticos eStore CE+PI pelo WhatsApp**. O filtro foi implementado diretamente no banco Supabase em `estore_queue_whatsapp_incident` e `estore_claim_whatsapp_alerts`, protegendo tanto a criação quanto a saída da fila. Mensagens pendentes para não supervisores são canceladas.

- **Gerentes ficam excluídos de todos os disparos automáticos de alerta de performance pelo WhatsApp**, mantendo seus cadastros como referência administrativa e sua visão gerencial no aplicativo.
- O teste manual previamente autorizado do supervisor Fran Lima (108) é tratado separadamente, sem abertura para outros números.
- Permanece `estore_alert_config.whatsapp_enabled=false`. O canal regional não foi ativado.
- Folga, férias e verificação de jornada por resposta ao WhatsApp continuam **previstos, ainda não implementados**; não habilitar disparos regionais antes desses controles e da confirmação de entrega no piloto.
- Teste transacional com rollback confirmou **1 supervisor elegível e 0 gerentes** na fila simulada, sem qualquer envio externo.
