# Firebase Cloud Messaging — eStore CEPI

## Configuração de push remoto (Android PWA)
Chave pública VAPID (Web Push), recebida do administrador em 23/10/2026:
`BPzAce5uLvF3PUgsq5fiMd3C-3cTOKCrvS00PliPt8ngTgRWYJbD1j2FLsOoByz9TLQzPm0fBpPYzWQ2rZ-EC2Y`

Esta chave é pública, e não dá autorização para envio. Não incluir chave privada, JSON de conta de serviço, tokens OAuth ou credenciais Supabase em GitHub Pages.

### Pendências de integração
1. Obter a configuração Web do Firebase: apiKey, authDomain, projectId, appId, messagingSenderId (e storageBucket quando fornecido). A chave VAPID isolada não é suficiente para obter um token FCM.
2. Registrar service worker Firebase Messaging na **raiz do escopo do PWA** e integrar getToken com serviceWorkerRegistration e vapidKey. Testar em Chrome Android com notificações habilitadas. Se o app instalado não estiver no mesmo escopo, rever instalação e assinatura de push.
3. Registrar o token do dispositivo em backend autenticado (nunca na página pública de teste) e restringir o piloto à conta do administrador / matrícula 2457695 validada no servidor. Usar Supabase com RLS e endpoint de registro sujeito a identidade real, não matrícula autodeclarada.
4. Implantar envio FCM HTTP v1 no backend com conta de serviço protegida em Secrets (OAuth2), usando endpoints Google. Não embutir credenciais no front-end.
5. Enviar push de teste somente por ação autenticada do administrador; comprovar FCM message ID, retorno e recebimento no Android com app fechado. O envio pode ser aceito sem entrega; só confirmar sucesso após teste no aparelho.
6. Não enviar automaticamente para demais supervisores sem opt-in, limite de volume, regra de expiração e configuração da central.
7. Não garantir sirene em modo silencioso ou recursos reservados à Defesa Civil.

Status: VAPID recebida, **envio remoto ainda não implantado**, nenhuma mensagem enviada.
