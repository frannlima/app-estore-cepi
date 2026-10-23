# Integração Power BI → eStore CE+PI (preparação, não ativada)

## Estado em 22/10/2026
- O Power BI está acessível pelo navegador corporativo, mas **não existe autorização comprovada de API nem credencial de serviço** para consulta independente do navegador.
- O Supabase já dispõe de `pg_cron`, `pg_net` e `supabase_vault`.
- A origem D-1 do app é `public.daily_updates`; comparativos oficiais do Painel Executivo são mantidos em `public.estore_executive_benchmark`. O app mantém também fontes especializadas para vendas por colaborador, metas, comissões, BOPIS, histórico semanal e Hora a Hora.
- Nenhum cron de consulta ao Power BI deve ser ativado até que autenticação corporativa, modelo semântico, colunas e validações estejam confirmados.

## Autorização e descoberta (pré-requisitos)
1. Identificar **ID do modelo semântico (dataset)** do relatório, sem confundir com ID do relatório ou da página.
2. Confirmar com TI se a API **Dataset Execute Queries** está habilitada no tenant e se a identidade de consulta tem `Dataset.Read.All` e **Read/Build** no modelo. Modelos com RLS/SSO podem impedir o uso de identidade de aplicativo; nesse caso, avaliar fluxo corporativo delegado ou exportação agendada aprovada.
3. Obter documentação das medidas e dimensões reais: data, filial, região, empresa, captação, aprovado, pedidos, faturamento/venda total, share, matrícula, BOPIS e demais atributos. **Não adivinhar medidas DAX nem nome de tabela.**
4. Separar dados eStore de dados corporativos. Receber autorização explícita antes de exportar dados nominativos ou financeiros para a base Supabase/GitHub Pages. Aplicar minimização e controle de acesso.
5. Gerenciar tokens e credenciais **somente em secrets de servidor/Vault**, nunca no front-end, em GitHub Pages ou em prints e chats.

## Contrato de entrada esperado
- `period`: day | week | month
- `start_date` / `end_date`: datas ISO locais, validadas; para day, iguais
- `company`: `captured`, `store_sales`, `share`, `orders`, `approved` (se existentes)
- `regional`: mesmos campos, consolidados **a partir dos denominadores e numeradores**, não por média simples dos shares individuais
- `stores[]`: filial (somente o universo CE+PI ativo), captação, pedidos, aprovado, venda total, share, meta e demais campos oficiais quando existentes
- `collaborators[]`: se autorizado e disponível, matrícula/filial/valores e atributos indispensáveis ao indicador
- `source`: modelo e versão do relatório, horário de atualização, intervalo e identificador da execução; `checksum` para idempotência

## Distribuição e regras
- D-1: manter `daily_updates` como histórico; conferir totais com os lançamentos do app sem somar dados repetidos. A publicação oficial do dia só substitui números depois de reconciliação.
- Semana/mês: o relatório do intervalo é um **snapshot acumulado**; nunca adicionar o valor integral de um período ao snapshot anterior.
- Shares: `regional_share = regional_captured / regional_store_sales` e `company_share = company_captured / company_store_sales` quando há denominadores oficiais positivos; se o Power BI publicar shares oficiais, validar a diferença antes de usar. `delta_pp = (regional_share-company_share)*100`.
- Rankings, comissões e Pool: **não** trocar captação por aprovado; preservar regras de BOPIS, eDay, elegibilidade e períodos.
- Hora a Hora: seguir como fonte operacional de entrada ao vivo; sincronização de Power BI não apaga registros.
- Metas e colaboradores: preservar suas fontes oficiais, a menos que novas informações equivalentes sejam comprovadamente acessíveis.
- Exclusões regionais fixas: 089, 090 e 109.
- Nunca preencher ausência de share empresa com valores desatualizados de outro período.

## Fluxo de sincronização (ativar só após autorização)
1. Agendar execução no fuso America/Fortaleza após a atualização oficial do relatório.
2. Servidor recupera token de forma segura, executa consulta DAX aprovada, verifica data/fonte e normaliza dados.
3. Gravar resposta **em staging** e gerar trilha de auditoria; recusar cobertura incompleta, datas divergentes, totais discrepantes ou mudança brusca não explicada.
4. Promover transacionalmente para tabelas existentes, com upsert idempotente por `source+period+start_date+end_date+entity`.
5. Invalidar caches necessários e registrar status de atualização por período e última fonte válida.
6. Notificar administrador quando falhar, sem apagar último resultado válido nem publicar dado incerto.

## Critérios mínimos de aceite
- D-1, semana e mês mostram as datas corretas, captação, pedidos, shares CE+PI/empresa e variação p.p.
- Importação repetida não duplica pedidos nem valores.
- A soma das filiais CE+PI concilia com a regional; valores da empresa >= regional quando as bases são comparáveis.
- Comissões, BOPIS, campanhas, dispersões e Hora a Hora não sofrem regressões.
- Falta de dado deixa campo explícito como indisponível com fonte e motivo.
- Há opção de rollback e logs de sincronização, com acesso administrativo restrito.

## Primeira verificação com o plugin Power BI no ChatGPT Desktop
No modo Work, com o relatório aberto e autenticação corporativa, solicitar **apenas metadados**: ID do modelo semântico, nomes/descrições das medidas e dimensões, presença de RLS/SSO, possibilidade de exportar D-1/semana/mês e limitações de acesso. Não enviar credenciais, tokens, planilhas de colaboradores ou dados sensíveis ao repositório.

Fontes de referência:
- Microsoft Learn: https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries
- Supabase: https://supabase.com/docs/guides/functions/schedule-functions
