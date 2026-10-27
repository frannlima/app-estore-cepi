# Dossiê de criação e evolução — App eStore CE+PI

## Identificação e atribuição

Criador e idealizador declarado: **Fran Lima — Francimar Lima**. Responsável pela concepção, direcionamento funcional, definição das necessidades operacionais e evolução solicitada do projeto, conforme sua declaração e os créditos já existentes no código anterior a esta entrega.

O desenvolvimento utiliza assistência de inteligência artificial. O nome do autor de um commit identifica o registro da alteração, não significa que cada linha tenha sido digitada manualmente por essa pessoa. Componentes e serviços de terceiros preservam seus próprios direitos. A marca Riachuelo e os dados operacionais não são reivindicados como propriedade pessoal do criador.

## Objetivo, necessidade e público

Organizar o acompanhamento eStore da Regional CE+PI em um ambiente acessível no celular e no computador. A necessidade atendida é reduzir a dispersão de informações, dar visibilidade às metas e resultados e apoiar a atuação dos responsáveis pelas filiais. Público: colaboradores, supervisores, gerentes e administração, conforme as permissões de cada perfil.

## Funções do projeto

- Acompanhamento de metas, vendas, pedidos, share e comissões.
- Visões de resultado individual, filial, time e regional.
- Rankings, campanhas e regras de elegibilidade, incluindo tratamento de BOPIS.
- Hora a Hora, atualização das parciais, alertas de pendência e compartilhamento de cards.
- FCA semanal das lojas priorizadas e encaminhamento ao supervisor responsável.
- Centralização de cargas D-1, semana e mês e propagação aos painéis dependentes.
- Comunicação operacional, suporte e experiência de aplicativo instalável (PWA).

O inventário descreve a finalidade e módulos encontrados no código. Não constitui certificação de que toda integração externa esteja concluída ou validada em produção.

## Evidências da criação e da evolução

Base analisada: commit `2b09fc8f125e500745ec8ddf22de0aa7f7e367ec`, anterior à publicação deste dossiê.

| Evidência | Resultado |
| --- | --- |
| Primeiro commit da linha principal | 19/09/2026, 00:59:18, UTC−03 |
| Identificador inicial | ec44a81c0e4623594428602ee790c4957b4f75ba |
| Descrição inicial | Inicializa publicação do App eStore |
| Último commit da base analisada | 26/10/2026, 16:08:12, UTC−03 |
| Commits alcançáveis da linha principal | 951 |
| Dias distintos com commits | 34 |
| Intervalo entre datas, incluindo início e fim | 38 dias corridos |
| Autor registrado nesses commits | frannlima |
| Horas efetivamente trabalhadas | Não apuradas |

O primeiro commit comprova o primeiro registro encontrado nesta linha de histórico, não necessariamente o início da ideia ou de trabalhos anteriores à publicação. Datas e nomes são metadados Git; podem ser confrontados com registros do provedor e outras evidências. Dias com atividade e quantidade de commits não equivalem a jornadas ou horas de trabalho.

Os anexos em `evidencias/` preservam: histórico completo da linha principal em CSV; atividade diária com campos vazios para horas comprovadas; resumo em JSON; e SHA-256 de cada arquivo rastreado da versão de referência. Esses hashes permitem comparar a integridade de uma cópia com a base identificada. Não são assinatura digital nem carimbo de tempo certificado.

## Marcos verificáveis

- Publicação inicial e configuração GitHub Pages em 19/09/2026.
- Conexão de atualização ao banco persistente, registrada em 19/09/2026.
- Evolução de navegação, perfis, metas e rankings no histórico subsequente.
- Melhorias contínuas de importação, Hora a Hora, alertas, campanhas e FCA, documentadas nas descrições dos commits anexos.
- Até a versão de referência: correções da fila de FCA, acesso às priorizadas e saudação conforme horário de Fortaleza em 26/10/2026.

## Tempo dedicado e melhorias

Não foi encontrado apontamento de horas contemporâneo às tarefas. Não se estimou tempo pela diferença entre commits, nem se converteu quantidade de alterações em horas. Para comprovação de esforço, complementar com registros de início/fim, tarefa, responsável e evidência, distinguindo horas comprovadas de estimativas declaradas. O CSV de atividade diária permite essa complementação sem inventar números retroativos.

## Ganhos esperados e mensuração

| Benefício pretendido | Forma de medir |
| --- | --- |
| Menos consolidação manual | Minutos por fechamento antes e depois |
| Maior disciplina de atualização | % de filiais com parcial dentro da janela |
| Tratativa mais rápida | Tempo entre alerta, atualização e conclusão da FCA |
| Maior consistência | Divergências entre carga gerencial e menus dependentes |
| Mobilização comercial | Lojas ativas, pedidos e share por período |
| Visibilidade individual | Utilização dos painéis e consultas de metas/comissão |

Não foram fornecidas medições comparáveis antes/depois. Não se afirma economia em horas, aumento de vendas ou retorno financeiro causado pelo app. Resultados comerciais também dependem de outros fatores. Registrar período, fonte, fórmula e base comparável antes de atribuir ganho quantitativo ao projeto.

## Autoria e titularidade: alcance deste documento

Este dossiê organiza evidências técnicas e registra a atribuição declarada a Francimar Lima. Não substitui assinatura, contrato, registro no INPI ou análise da titularidade dos direitos patrimoniais. A hospedagem em conta pessoal não determina, isoladamente, propriedade exclusiva.

Como a ferramenta atende uma operação empresarial, a titularidade deve ser analisada à luz do contrato, da natureza das atribuições e dos recursos utilizados, conforme art. 4º da Lei 9.609/1998. Não foi analisado contrato de trabalho nem eventual cessão. O registro no INPI pode reforçar a segurança jurídica, após a correta identificação de autor e titular. Não se declara que houve pedido ou certificado de registro.

Fontes oficiais:

- https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/guia-basico
- https://www2.camara.leg.br/legin/fed/lei/1998/lei-9609-19-fevereiro-1998-364738-normaatualizada-pl.html

## Preservação recomendada

Preservar histórico sem reescrita, cópias do código, documentos de requisitos e registros de aprovação. Acrescentar apontamentos de horas e evidências de decisões. Para formalizar direitos exclusivos, verificar as condições aplicáveis e, então, preparar declaração/contrato e eventual registro no INPI. Credenciais, tokens, dados pessoais e segredos comerciais não devem integrar anexos públicos.
