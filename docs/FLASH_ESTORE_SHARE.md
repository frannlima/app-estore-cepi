# Share eStore com denominador Flash

## Origem
Coleta Flash do Meu Acompanhamento (Supabase vvgejviwvtnlahbyopah), autenticada por e-mail vinculado à matrícula de administrador. Após salvar, `flash-sync` consulta `estore-flash-sales`, que verifica a identidade administrativa e **lê a última coleta já salva da origem**, sem aceitar valores financeiros enviados pelo navegador.

## Destino
Tabela privada `public.estore_flash_store_sales` no projeto eStore (fndkjgveeojlywkdrtxe), chave composta de data/filial, RLS ativado e sem leitura pública. A função `estore-api`, ação `hourly_get`, responde com `storeSales` = Total Flash real, `storeTarget` = meta (inalterada), `share` = captação eStore / Total Flash, além de `shareSource`, `flashCollectedAt` e `regionalFlash`.

## Regra de integridade
- Data da coleta = dia corrente no fuso America/Fortaleza; coleta completa de 18 filiais, feita nos últimos 45 minutos.
- Atualizações são idempotentes e dados antigos não sobrescrevem coletas mais recentes.
- Venda Flash não é confundida com venda Web, meta, captação eStore ou total sem OMNI; o denominador é **Total Flash**, sem subtrair OMNI.
- Sem Flash válido: share da filial é nulo (—); share regional só deve ser apresentado como regional completa com 18/18 filiais.
- Se o administrador não confirmou e-mail no Meu Acompanhamento, a coleta fica local e o eStore permanece pendente.

## Teste operacional
Faça uma nova coleta Flash de 18 filiais, confirme e-mail e matrícula no Meu Acompanhamento, salve coleta compartilhada e confira o aviso de sincronização 18/18. Na tela eStore CE+PI → Hora a Hora, atualize: coluna Share Flash deve mostrar captação dividida pelo Total Flash da mesma filial. O card compartilhável traz a cobertura da coleta.

## Nota
A função `estore-api` foi sincronizada com a versão 149 implantada. A gravação e a leitura usam service role apenas nas funções de servidor, nunca no GitHub Pages.
