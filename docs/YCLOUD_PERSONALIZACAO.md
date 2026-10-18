# Personalização dos alertas — revisão V2

Implementação preparada para revisão, sem transporte real e sem ativação regional.

Modelo proposto: `estore_cepi_alerta_parcial_v2`, Português BR. Categoria proposta Marketing, pois o modelo anterior foi reclassificado assim no console em 18/10/2026. A nova versão não foi submetida nem aprovada.

Ordem das variáveis: 1 primeiro nome (prioriza nome social; fallback liderança), 2 filial, 3 meta financeira diária em BRL, 4 pedidos do dia, 5 situação, 6 data/hora de São Paulo, 7 link Hora a Hora.

O número do destinatário vem exclusivamente do contato validado vinculado à matrícula e filial. O nome vem do colaborador correspondente, nunca de consulta reversa ao WhatsApp. Metas devem ser obtidas da fonte oficial da filial e data; não aceitam outra loja, outro dia ou meta ausente. A preparação bloqueia perfis não supervisores, ausência de consentimento, falta de validação, turno incompatível e lojas excluídas. O módulo só gera simulação e não chama o provedor.

Caminho confirmado no código do app: Metas → informar HC disponível → Salvar HC → Ratear igualmente (ou ajustar no botão Meta) → Compartilhar meta.

Links preparados: `?menu=hourly` e `?menu=metas`. A autenticação é preservada, a rota só é aplicada após login real e nunca altera filial ou matrícula; visitante permanece em leitura. Só serão públicos após merge/deploy desta alteração.

Preserva o modelo original de três parâmetros e a Edge Function de simulação atual. Não cadastra contatos, não muda secrets, não agenda mensagens e não altera `whatsapp_enabled=false`. O módulo V2 ainda precisa ser ligado à consulta autenticada dos cadastros, metas e escalas antes de operar em produção.

## Validação

`node --test tests/*.test.mjs`: 66 testes locais sem rede aprovados (47 existentes + 19 novos). Cobre personalização, nome social, fallback, metas de outra loja/dia, elegibilidade, sete variáveis, limite de 1.024 caracteres, navegação após login e visitante.

## Pendências reais

- Integrar V2 à origem autenticada de cadastros/metas/escalas e ao piloto restrito.
- Publicar e verificar os links no app após merge.
- Submeter V2 à YCloud, verificar a aprovação e a identidade comercial (não realizado).
- A documentação atual de exemplos não pôde ser verificada: fixture marcada `synthetic_unverified`, fora de transporte real. Contrato fixado: SHA-256 8592bd4cc37186655a480dd86ce6bac6731543727327a2871d9103a0b8ed9e81, criação POST /whatsapp/templates; envio separado POST /whatsapp/messages, somente template aprovado. Não há chamada real neste trabalho.
- Transferir secret por canal seguro e concluir testes autenticados da integração original.
- Exigir autorização específica com destinatário, remetente, modelo e custo antes de qualquer teste real. Nunca considerar aceite como entrega.
