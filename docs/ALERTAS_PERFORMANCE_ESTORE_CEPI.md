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
6. O resultado é auditado em `estore_alert_wa_outbox` com status `sent`, `failed` ou `sending`. Não há reenvio automático após resultado incerto, para prevenir duplicidades.

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

## Proposta inicial: janelas de envio por cargo (17/10/2026)

**Status: proposta para implementação futura — não implantada como regra de envio. O WhatsApp regional deve permanecer desativado.**

| Cargo | Janela de referência para WhatsApp | Condição obrigatória |
| --- | --- | --- |
| Gerente de loja | 12h00–18h00 (America/Fortaleza) | Somente durante a jornada individual confirmada |
| Supervisor | 14h00–21h00 (America/Fortaleza) | Somente durante a jornada individual confirmada |

Diretrizes de implementação antes de ativar o canal regional:

1. O horário de envio deverá pertencer **à interseção da janela de referência do cargo com a jornada efetivamente escalada do destinatário**. A escala individual prevalece, inclusive quando começar depois ou terminar antes da janela do cargo.
2. **Bloquear** qualquer WhatsApp destinado a pessoa em folga, férias, afastamento ou sem escala individual válida para a data/hora. Não presumir jornada pela abertura da loja nem pelo cargo.
3. Após a segunda parcial irregular, gerar ocorrência normalmente no radar interno; encaminhar WhatsApp **somente** quando o destinatário estiver dentro da janela permitida e da jornada individual. Não encaminhar cobrança atrasada no próximo turno/dia por ocorrência encerrada.
4. Respeitar filiais sem operação prevista/meta eStore zerada, feriados e horários de funcionamento. Excluir 089, 090 e 109.
5. O disparo deve ser individualizado e direcionado à liderança correta, com telefone, matrícula, cargo e filial validados, opt-in e template Meta aprovados; aplicar idempotência e histórico auditável.
6. Revisar com RH/Jurídico/Políticas internas o tratamento de jornada, plantões e exceções; qualquer margem de segurança antes da saída requer aprovação específica. Não configurar exceções de sobreaviso implicitamente.
7. Manter `estore_alert_config.whatsapp_enabled=false` até a conclusão do teste no número autorizado e a implementação/validação do filtro de jornada no backend, sem ativação regional automática.

A programação existente do monitoramento interno (12h05–21h05) **não deve ser confundida com autorização para envio por WhatsApp**. Esta proposta define apenas elegibilidade futura por cargo e escala, não altera o Cron existente nem habilita mensagens externas.


## Regra confirmada: gerentes excluídos dos alertas por WhatsApp (17/10/2026)

A partir desta definição, **somente colaboradores cadastrados com `profile_type='supervisor'`, matrícula correspondente à filial e situação `Atividade Normal` podem ser destinatários dos alertas automáticos eStore CE+PI pelo WhatsApp**. O filtro foi implementado diretamente no banco Supabase em `estore_queue_whatsapp_incident` e `estore_claim_whatsapp_alerts`, protegendo tanto a criação quanto a saída da fila. Mensagens pendentes para não supervisores são canceladas.

- **Gerentes ficam excluídos de todos os disparos automáticos de alerta de performance pelo WhatsApp**, mantendo seus cadastros como referência administrativa e sua visão gerencial no aplicativo.
- O teste manual previamente autorizado do supervisor Fran Lima (108) é tratado separadamente, sem abertura para outros números.
- Permanece `estore_alert_config.whatsapp_enabled=false`. O canal regional não foi ativado.
- Folga, férias e verificação de jornada por resposta ao WhatsApp continuam **previstos, ainda não implementados**; não habilitar disparos regionais antes desses controles e da confirmação de entrega no piloto.
- Teste transacional com rollback confirmou **1 supervisor elegível e 0 gerentes** na fila simulada, sem qualquer envio externo.
