# Central de Alertas — revisão e preparação

Disponível em Administração → Central de Alertas. Protegida no servidor pela matrícula e senha do administrador principal; visitante e matrícula isolada não dão acesso aos contatos. Nenhum telefone foi incluído no repositório público.

Importação de 20/10/2026: 28 contatos da relação textual mais recente, 24 correspondências exatas por tokens de nome e filial. Quatro vínculos pendentes: Regya Dantas (146), Mari (175), Mateus Oliveira (238) e Dani (318). Sugestões nunca viram contatos autorizados automaticamente. Todos os números vieram com oito dígitos após DDD: nono dígito é apenas sugestão para revisão explícita. Recebimento de uma lista não comprova consentimento.

Parciais: print selecionado fica local; hash SHA256 e situações conferidas são salvos em tabela privada. Nesta versão a imagem NÃO possui OCR automático: administrador compara o print, informa data/hora e valida as lojas, ou cola o texto do grupo para interpretação assistida. Número após seta é meta, ausência de valor é ausência de informação e não zero comprovado. Captura e hora devem ser do dia atual entre 14h e 21h59. Mesmo print ou mesma parcial/hora não se duplica. Não há captura automática do grupo.

Interface: 18 lojas, situação do app e do grupo, contatos privados, edição de matrícula/telefone/registro de consentimento, prévia personalizada com meta do dia e link Hora a Hora. Atualização é por abertura/recarregamento da central. Não há serviço autônomo novo disparando às 14h.

Limites: WhatsApp e Notificar no app estão desativados. Próxima ativação depende de telefone confirmado, consentimento, escala individual/folgas/férias/afastamentos e teste no número pessoal autorizado. A API desta central não envia mensagem e não consome YCloud. Abertura de conversa não é entrega. Não há push instalado por esta mudança. Mantido estore_alert_config.whatsapp_enabled=false, first_hour=14. A autenticação do aplicativo existente não foi modificada.

Validação: node --test tests/alert-center.test.mjs; node --check alert-center.js. Negativos do endpoint: sem senha=401, senha inválida=403. Fluxo autenticado e telefone/entrega ainda exigem validação no aplicativo.
