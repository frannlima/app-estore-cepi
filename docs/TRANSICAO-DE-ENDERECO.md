# Transição de endereço — App eStore CE+PI

## Estado desta entrega

Preparação publicada; domínio novo ainda não registrado/configurado. O acesso atual permanece em operação, sem redirecionamento obrigatório. Nenhum usuário deve reinstalar agora. Não há destino fictício nem promessa de migração já concluída.

## Arquitetura e continuidade

O endereço atual deve continuar servindo a aplicação durante a convivência. O domínio próprio será publicado em paralelo, a partir do mesmo código e com a mesma base de serviços, evitando relatórios divergentes. Não adicionar CNAME ao site atual nesta fase: isso pode redirecionar toda a origem antes de validar os aplicativos instalados. Definir o provedor e automatizar a publicação paralela quando o domínio estiver disponível.

`app-transition-config.js` concentra o destino aprovado. `phase: 'preparing'` e `publicBase: ''` mantêm os acessos existentes. Somente após os testes, configurar `phase: 'active'`, `publicBase` com a URL HTTPS real (incluindo eventual subdiretório) e atualizar `revision`.

Os links de compartilhamento, alertas, FCA e apresentações passam a usar a base centralizada. Parâmetros de menu, filial e semana devem ser preservados. O compartilhamento nativo com campo `url` não deve adicionar uma segunda cópia do endereço no texto.

## Comunicação aos usuários

Aviso visível no login e na área do app, sem bloquear a rotina:

> Estamos preparando um novo endereço para o App eStore CE+PI. Continue usando este acesso. Após a mudança, poderá ser necessário entrar novamente, reinstalar o app e autorizar as notificações. Não reinstale agora; o novo link será informado aqui.

Após a ativação, o aviso explica o novo acesso, o novo login por matrícula e a eventual reinstalação e autorização de notificações. A página Sobre o App mantém as orientações disponíveis.

## Validação antes da ativação

- Domínio sob controle do responsável, DNS e certificado HTTPS válidos.
- Mesmo código publicado nos dois endereços e mesma base de serviços; não duplicar bancos.
- Login de colaborador, supervisor, administrador e modo visitante.
- Links `?view=home`, `?menu=hourly`, parâmetros FCA com filial e semana.
- Navegação, cards e compartilhamento sem URLs duplicadas.
- Testes em navegador Android, PWA instalada antiga, nova instalação e computador.
- Confirmar dados salvos no servidor antes de remover instalações. Rascunhos e preferências locais não são transportados automaticamente entre domínios.
- Reativar notificações no novo endereço e cadastrar novo dispositivo/token; não apagar inscrições antigas antes de confirmar recebimento no novo acesso. Evitar duplicidade de envios.
- Manter caminho de retorno e suporte durante a convivência. Não colocar credenciais ou tokens em links de migração.

## Limites e reversão

Sessão, cache, armazenamento e permissões pertencem à origem. Não prometer migração automática entre github.io e domínio próprio. Em caso de falha, retornar a configuração a `preparing` e manter o endereço antigo disponível. Este documento não declara execução de testes no domínio novo antes de ele existir.

Referências: https://web.dev/articles/multi-origin-pwas e https://developer.chrome.com/blog/seamless-pwa-origin-migration (migração automática descrita pelo Chrome é restrita a origens do mesmo site).
