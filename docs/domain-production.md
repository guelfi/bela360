# Dominio de producao na OCI compartilhada

URL canonica: `https://bela360.com.br`. A infraestrutura nginx e compartilhada com os demais projetos. Este repositorio usa `docker-compose.oci.yml`, sem portas publicadas no host e sem nginx proprio.

## Preparar antes do primeiro deploy

1. Criar DNS A da raiz para o IPv4 publico OCI; `www` deve apontar para a raiz. So publicar AAAA se IPv6 estiver operacional. Preservar registros MX/TXT de email.
2. Preparar no nginx global os hosts `bela360.com.br` e `www.bela360.com.br`, com certificado valido, redirect HTTP para HTTPS e `www` para a raiz.
3. No host canonico, encaminhar `/` para `bela360-web:3000` e `/api/` para `bela360-api:3001`, preservando o caminho `/api/` (sem a barra final no `proxy_pass` que removeria o prefixo). Repassar Host, X-Real-IP, X-Forwarded-For e X-Forwarded-Proto. O nginx-proxy deve estar conectado a rede `bela360_bela360-network`.
4. Mesclar os valores publicos de [`.env.oci.example`](../.env.oci.example) no `.env` **existente** em `/var/www/bela360`. Preservar todos os segredos e valores de banco. Nao substituir todo o arquivo pelo exemplo, pois ele so contem as URLs e flags da migracao.
5. Preparar DNS, certificado e proxy **antes** de publicar o commit na main, pois o CI verde dispara deploy automatico. O mesmo deploy muda a imagem para base path vazio. Configurar aliases antigos para redirecionar `/bela360/...` ao dominio novo removendo o prefixo; planejar tambem a compatibilidade das antigas URLs de API e callbacks.

As variaveis GitHub opcionais `OCI_SMOKE_URL` e `OCI_API_SMOKE_URL` sobrescrevem os checks publicos. Os defaults sao `https://bela360.com.br/` e `https://bela360.com.br/api/health`. Use overrides somente para uma transicao explicita; HTTPS, identidade do projeto e rotas finais devem ser verificados antes de concluir a migracao. Os checks exigem HTTP 200 direto na URL canonica, sem seguir redirecionamentos, com validacao TLS.

## Build, ambiente e compatibilidade local

`NEXT_BASE_PATH` e `NEXT_PUBLIC_API_URL` sao argumentos de **build**: alterar somente o ambiente do container nao muda os bundles. O compose OCI agora usa raiz por default (`NEXT_BASE_PATH=`), enquanto os composes locais existentes mantem sua configuracao. Para rollback temporario do layout antigo, restaurar o base path `/bela360` e a antiga URL publica da API no ambiente OCI, junto do roteamento nginx correspondente, e reconstruir a imagem.

`FRONTEND_URL` e uma **origem**, sem caminho nem barra final; CORS e CSRF comparam o Origin exatamente. Redirect de `www` para o host canonico evita duas origens de sessao. `CORS_ALLOWED_ORIGINS` aceita origens adicionais separadas por virgula quando necessario.

A API do Bela inclui `/api` na propria base publica: `NEXT_PUBLIC_API_URL=/api`.
`API_URL` e `APP_URL` precisam ser repassadas ao container para callbacks do WhatsApp e links profissionais. Reconfigure os callbacks das instancias Evolution ja existentes depois da migracao; nao recrie nem apague suas sessoes. O callback deve chegar a `/api/whatsapp/webhook`.

`COOKIE_SECURE=true` e adequado a HTTPS; desenvolvimento HTTP usa `false`. Os cookies continuam HttpOnly, SameSite=Lax, host-only e Path=/. Sessoes anteriores pelo IP nao migram automaticamente ao dominio; o usuario entra novamente.

## Validacao e rollback

Depois do deploy, verificar landing, JS/CSS/imagens, pagina profunda, API, login, renovacao de sessao, logout e admin. Validar que links e callbacks usam o dominio correto e nao incluem `localhost`, IP, caminho antigo ou outro projeto. O check automatico de API confirma disponibilidade HTTP, nao substitui esse fluxo funcional.

Antes da mudanca, preservar configuracao nginx, imagem/commit anterior e valores antigos de URL/base path. Se houver regressao, reverter nginx, imagem e ambiente de forma coordenada. Nao remover volumes nem recriar bancos ou sessoes Evolution.

O workflow executa `git reset --hard origin/main`: mudancas manuais em arquivos versionados do servidor desaparecem no proximo deploy. Manter as correcoes no repositorio. O nginx global deve ter sua propria fonte versionada; este workflow nao o reconfigura nem recarrega.
