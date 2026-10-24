# Central Push CEPI — implantação do piloto restrito

## Estado executado em 23/10/2026
- Função Supabase ativa: `estore-push-pilot` no projeto `fndkjgveeojlywkdrtxe`.
- Tabelas protegidas com RLS e sem SELECT para `anon` ou `authenticated`: `estore_push_devices`, `estore_push_delivery_log`, `estore_push_settings`.
- Matrícula autorizada no servidor: `2457695`; senha administrativa validada no servidor contra o hash já usado no eStore. Token FCM nunca retornado pelas APIs.
- Um token do Android cadastrado na base privada, sem exposição no GitHub.
- `automatic_enabled=false`, `pilot_only=true`. Nenhuma mensagem enviada pelo novo endpoint até agora.
- Console administrativa: https://frannlima.github.io/app-estore-cepi/central-push/
- Botão de link no menu Administração do Meu Acompanhamento.
- A ligação entre pendências operacionais e disparos automáticos **não foi ativada**. Não há rotina/cron de envio para outras filiais.

## PENDENTE — credencial privada de envio FCM
O teste manual no Firebase Console já funcionou, mas o backend Supabase precisa de uma identidade de serviço própria para acessar a **FCM HTTP v1 API**.

1. No Firebase Console do projeto `estore-cepi`, acesse **Configurações do projeto → Contas de serviço**.
2. Crie uma conta de serviço com apenas a permissão necessária para enviar mensagens FCM (Firebase Cloud Messaging API Admin, conforme permissões do Google) e gere uma chave JSON privada. Não publique a chave em GitHub nem a envie em conversas.
3. No painel Supabase do projeto `fndkjgveeojlywkdrtxe`, abra **Edge Functions → Secrets** e configure o segredo de ambiente **`FIREBASE_SERVICE_ACCOUNT_JSON`** com o conteúdo JSON completo da credencial de serviço. O campo `project_id` dentro da credencial deve ser `estore-cepi`.
4. Verifique que a API Firebase Cloud Messaging está habilitada no Google Cloud.
5. Abra a Central Push, informe a senha administrativa do eStore e clique **Consultar estado da central**. O indicador `Serviço remoto` deve mostrar `configurado`.
6. Clique **Enviar teste remoto para meu Android**. Se o FCM aceitar, o backend apresenta um ID de mensagem. Confirme fisicamente o recebimento no Android; aceitação não equivale a entrega.
7. Se o token do Chrome expirar, abra a Central Push no Chrome do Android e clique **Vincular meu Android** para registrá-lo novamente.

## Regras de segurança
- O piloto sempre consulta exclusivamente o token armazenado para `2457695`; não recebe token como parâmetro de envio.
- A chave privada reside em Secrets; Firebase `apiKey` e VAPID públicos são apenas configuração cliente.
- O botão de envio exige senha administrativa válida, aplica limite de 1 teste/minuto e máximo 12/24h.
- Automação de pendências regional desligada até integração de dados, elegibilidade das duas últimas parciais e homologação dos contatos.
- Nenhuma campanha geral, tópico ou envio em massa foi habilitado.

## Próximos incrementos previstos (não implementados neste piloto)
1. Integrar as fontes de eventos eStore e Flash com chaves de deduplicação por filial, período, origem e indicador.
2. Enviar aviso automático a cada loja apenas após 2 parciais consecutivas e regras de horário/folga e consentimento.
3. Adicionar ao Administrativo painel de fila, eventos de entrega, reenvio e pausas e aprovar ativação gradual.
4. Resolver separadamente os avisos de segurança sobre RLS em outras tabelas do Meu Acompanhamento, antes de expor novos dados pessoais.


## Atualização técnica — radar de parciais (23/10/2026)
- View privada `estore_push_pending_preview`: verifica duas parciais consecutivas com condição `sem_alimentacao` ou `atrasada`; uma atualização registrada depois da última verificação cancela a elegibilidade. Não considera `zerada` automaticamente como falta de input.
- Janela de envio respeita fuso America/Fortaleza: 14h–17h59 para as lojas de rua 084, 113 e 146; 14h–21h59 para as demais. Os registros de avaliação expiram após 85 minutos para evitar cobrança por dados antigos.
- A central mostra separadamente: lojas com pendência na última consolidação, filiais elegíveis **agora** e ausência de sincronização Flash.
- Supabase Edge `estore-push-pilot` versão 3: ação `pending`, protegida por senha administrativa, para consultar o radar.
- Verificação: 18 lojas na base, 10 apontadas na última consolidação disponível, 0 elegíveis após o encerramento da janela. Nenhuma mensagem enviada pelo novo backend.

**Não declarar a automação homologada ou ativa:** faltam (a) `FIREBASE_SERVICE_ACCOUNT_JSON` nos Secrets do Supabase; (b) homologação do botão de teste remoto via servidor; (c) job de despacho recorrente com controles de opt-in, férias/folgas, deduplicação e responsáveis por filial; (d) origem Flash confirmada.
