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
- Lojas monitoradas: 073, 084, 108, 113, 138, 142, 146, 175, 177, 222, 238, 258, 262, 314, 318, 344, 350 e 552.
- Excluídas: 089, 090, 109.
- Fonte de dados: `public.hourly_estore` com exclusão de lançamentos apagados.
- Status: `sem_alimentacao`, `zerada`, `atrasada`, `regular`.
- Atualização considerada atrasada quando o último registro válido ultrapassa 70 minutos.
- Incidentes únicos por episódio; alertas desativados na regularização.
- Destinatários no aplicativo: perfis `supervisor`/`gerente` identificados por matrícula; supervisores com situação 'Atividade Normal' e exceção validada da gerente Rebeca (108).
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
- Teste reversível com verificações 12h05 e 13h05 simulou 41 notificações direcionadas; transação revertida, sem envios reais.
- Dry-run: `select public.estore_run_alert_monitor(now(),true);`
- Verificar job: `select jobid,active,schedule from cron.job where jobname='estore_cepi_two_partials_monitor_v1';`
- Verificar pendências: `select * from public.estore_alert_incidents order by opened_at desc limit 30;`
- Desativar: `update public.estore_alert_config set enabled=false,updated_at=now() where id=1;`
- WhatsApp só deve ser ativado após cadastro validado, consentimento documentado, templates aprovados e provedor oficial configurado.

## Atenção cadastral
A base `collaborators` ainda não apresenta todos os gerentes da regional; somente um gerente está cadastrado como perfil 'gerente' (108), com situação 'Inativo'. O alerta interno foi habilitado também para essa matrícula validada. A cobertura dos demais gerentes no app depende de suas matrículas/perfis corretos; **não assumir que números de telefone exportados do WhatsApp são matrículas**.
