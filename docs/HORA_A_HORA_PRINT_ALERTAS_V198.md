# Hora a Hora eStore CE+PI — Importação por print e alertas (v198)

## Importação por print do WhatsApp
- Administração → Hora a Hora → **Importar print / texto**.
- Selecionar a imagem do grupo (até 8 MB) ou colar o texto.
- A leitura OCR roda no dispositivo; a imagem não é enviada ao Supabase. O banco recebe somente valores conferidos, loja, data, horário e SHA-256.
- No padrão `073 ➜ 5`, o número **5 é a meta de pedidos**, não uma venda.
- O padrão `108 ➜ 8 159,98` sugere captação de R$ 159,98 após a meta; exige conferência e seleção da loja.
- Quando há mais de um valor (por exemplo `177 ➜ *4* 209,98/161,99`), o campo de venda fica **sem preenchimento automático** para revisão.
- Pedidos reais não são inferidos a partir das metas; informar somente quando forem conhecidos.
- Selecionar por loja se o valor representa *nova venda incremental* ou *total acumulado do dia*.
- Informar senha do administrador principal e confirmar data, horário e valores antes de registrar.
- O RPC do Supabase é transacional, bloqueia mesmo print por loja, ignora uma parcial anterior a lançamento já existente e grava auditoria.

## Status e alertas
- **Girando ponteiro:** venda positiva e alimentação recente.
- **Em curso:** lançamento já feito, mas sem caracterizar ritmo normal; ou venda confirmada em print do grupo.
- **X parciais sem input de venda:** intervalos sem atualização, calculados a partir dos horários da loja e do último input.
- **Sem input** não equivale necessariamente a venda zero.
- Central de alertas acessível dentro do Hora a Hora mediante matrícula de administrador e senha administrativa. Os nomes vêm da base de supervisores ativos.
- O fluxo cruza a parcial revisada mais recente do grupo, quando disponível, antes de preparar mensagens.
- Telefones não confirmados não ficam habilitados. O usuário deve conferir a jornada/folga e clicar individualmente para abrir mensagem pré-preenchida no WhatsApp.
- **Não há envio automático nem comprovação de entrega.** O canal automatizado anterior continua com suas próprias regras.

## Compartilhamento
- Card PNG vertical com marca Riachuelo clara no topo, KPIs, pulsos de lojas, tabela de 18 filiais e alerta compacto.
- Legenda com indicadores em uma linha e um único tópico de lojas sem input.
- O aplicativo de mensagens não aceita colorir resultados como texto azul no corpo da mensagem; azul é utilizado na imagem PNG.
- Link direto para Hora a Hora após o login: https://frannlima.github.io/app-estore-cepi/?menu=hourly

## Arquivos
- `hourly-workflow-v198.js`: importação, status, supervisores, legenda.
- `hourly-card-v198.js`: PNG do dashboard.
- `app-v2.css`: estilo responsivo.
- `alert-center.js`: rota direta de menu corrigida.
- `supabase/functions/estore-hourly-import/index.ts`: endpoint com autenticação pela senha administrativa.
- `public.estore_hourly_import_reviewed`: RPC auditável; chamada somente pela função de backend com service role.

O funcionamento de OCR depende das bibliotecas de reconhecimento carregadas no navegador e de conferência humana; não há leitura direta do conteúdo privado do grupo WhatsApp.
