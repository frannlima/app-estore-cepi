# YCloud — preparação do piloto (17/10/2026)

Estado: **preparação e simulação, integração real ainda incompleta**.

## Implementado

- Adaptador de enfileiramento `POST /v2/whatsapp/messages` e consulta `GET /v2/whatsapp/messages/{id}`, somente no servidor. Sem bibliotecas adicionais, retries ou chave em código.
- Modelo fixo `estore_cepi_alerta_parcial`, idioma `pt_BR`, três parâmetros de corpo, filtros de bloqueio e descadastro.
- Erros sem texto livre do provedor nos registros; request ID, código, Retry-After e resultado incerto separados.
- Aceitação de POST nunca confirma entrega. Consulta posterior distingue `accepted`, `sent`, `delivered`, `read` e valores desconhecidos. O adaptador ainda não é usado para chamadas reais.
- `estore-ycloud-test` implantada no Supabase, com JWT obrigatório e autenticação adicional pela chave de serviço. Apenas `diagnostics` e `simulate`; qualquer ação de envio real é rejeitada. Nenhum telefone é aceito no corpo da requisição.
- `estore_ycloud_simulations`, RLS ativa, sem acesso de anon/authenticated. Registra somente cenários sintéticos. UUID repetido retorna o mesmo registro; cenário diferente para o mesmo UUID resulta em conflito.
- Cenários: aceitação, rejeição, limite de taxa e timeout. O transporte de simulação é local e não acessa YCloud, mesmo quando houver credenciais configuradas.
- Predicado de elegibilidade testado para supervisor, matrícula/filial, opt-in, telefone validado e escala individual. **Ainda não conectado ao banco/dispatcher**, pois a fonte autoritativa de escalas precisa ser identificada. Não é um controle regional já implantado.
- Meta e funções `estore-whatsapp-alerts`, `estore-whatsapp-test` e `estore-whatsapp-webhook` preservadas.
- `whatsapp_enabled=false` confirmado por consulta. Não há ativação regional ou modificação de Cron.

## Evidências

`node --test tests/ycloud.test.mjs`: 47 testes locais sem rede aprovados. Cobrem autenticação, composição, precedência to/recipient, duplicidade e concorrência, erros, timeout, bloqueio regional, elegibilidade e distinção entre aceitação e entrega.

Supabase: migration `ycloud_simulations` aplicada e função `estore-ycloud-test` ativa, versão 1. Verificação SQL: RLS=true, anon SELECT=false, authenticated INSERT=false, service_role INSERT=true, WhatsApp regional=false. Chamada HTTP sem autenticação recebeu 401. Isso **não prova chamada autenticada, autenticação YCloud, funcionamento do remetente ou entrega**.

## Modelo proposto — ainda não submetido/aprovado

Nome: `estore_cepi_alerta_parcial`. Idioma: `pt_BR`.

Categoria candidata: `UTILITY`, por ser notificação operacional solicitada; a classificação e aprovação precisam ser confirmadas no provedor/Meta antes do teste. Não presumir elegibilidade nem preço pela categoria proposta.

```text
ALERTA eSTORE | CE+PI

Filial: {{1}}

Situação identificada: {{2}}

Horário da verificação: {{3}}

Após duas parciais consecutivas, a filial permanece em atenção. Verifique a captação e a atualização do Hora a Hora. Caso haja impedimentos, sinalize à regional para alinhamento das tratativas.
```

Exemplos sintéticos de parâmetros: `108 — FILIAL SIMULADA`, `Captação zerada em duas parciais simuladas`, `17/10/2026 13:05 (America/Fortaleza)`.

## Pendências para concluir

1. Autenticar YCloud: o navegador aberto estava na tela de login, com hCaptcha. Não foi possível confirmar a chave existente, WABA, remetente, saldo, preço ou template.
2. Cadastrar a chave exclusiva existente como `YCLOUD_API_KEY` em Edge Functions Secrets, sem expor o valor. Não criar outra chave ou alterar remetente. Confirmar remetente antes de configurar `YCLOUD_SENDER_E164`.
3. Verificar/submeter o template, com WABA e idioma corretos. Esperar aprovação real.
4. Ligar o adaptador ao teste individual com autorização de uso único, destinatário fixado exclusivamente pelo cadastro autorizado e configuração protegida. O cadastro atual termina em 3937; não publicar telefone completo no repositório. Não aceitar destinatários enviados pelo cliente nem disparar automaticamente pelo cadastro existente `manual_test_enabled=true`.
5. Implementar captura persistente de status (webhook YCloud autenticado e deduplicado, ou consulta protegida por ID) com correlação de remetente, destinatário e mensagem. O webhook Meta existente não interpreta eventos YCloud.
6. O agendador espera `estore_cepi_dispatch_service_key` no Vault, mas esse segredo não existe. Não copiar chaves para SQL, logs ou GitHub. Não é necessário resolver o agendador para autorizar o piloto individual.
7. Confirmar telefone completo do piloto, remetente, template aprovado e custo aplicável; obter autorização específica de Fran antes de qualquer envio real.
8. Consultar estado final no provedor; só declarar entrega mediante `delivered`/`read` associado à mensagem correta. Timeout exige reconciliação, sem reenvio automático.
9. Antes de qualquer ativação regional futura, ligar os filtros de escala/folga/férias/afastamento ao banco e validar com dados autorizados. Gerentes e filiais 089/090/109 permanecem excluídos. A exclusão adicional de 519 já existente foi preservada.

## Contrato utilizado

Referência OpenAPI YCloud v2 do Developer Kit, SHA-256 `8592bd4cc37186655a480dd86ce6bac6731543727327a2871d9103a0b8ed9e81`. Autenticação `X-API-Key`; sem garantia geral de idempotência do provedor. `externalId` é correlação local, não autorização para replay. A documentação pública consultada redirecionou para o novo portal, portanto reconfirmar o contrato atual antes de ligar transporte real.

O fluxo Meta regional existente chama de `sent` a aceitação inicial da API; não interpretar esse campo legado como entrega. Ele não foi modificado nesta preparação para preservar o comportamento do aplicativo. O novo adaptador diferencia aceitação de entrega.
