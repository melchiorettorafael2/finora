#!/bin/bash
# Publica a versão atual do Finora no servidor (front + API), sem apagar o banco.
# Uso (Git Bash, na raiz do projeto):  bash deploy/deploy.sh
# Lê IP, endereço e chave de deploy/.servidor (gerado pelo aws-criar-servidor.sh).
set -euo pipefail

PASTA="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(dirname "$PASTA")"
# shellcheck disable=SC1091
source "$PASTA/.servidor"
SSH_OPTS=(-i "$CHAVE" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
DESTINO="ubuntu@$IP"
REMOTO=/opt/finora

echo "== Build do front (produção)"
(cd "$RAIZ/finora-app" && npx ng build --configuration production >/dev/null)

echo "== Build da API"
(cd "$RAIZ/finora-api" && ./mvnw -q -DskipTests package)
JAR=$(ls "$RAIZ"/finora-api/target/finora-api-*.jar | grep -v plain | head -1)

echo "== Aguardando o servidor ficar pronto (Docker instalado)"
for i in $(seq 1 40); do
  if ssh "${SSH_OPTS[@]}" "$DESTINO" "docker compose version >/dev/null 2>&1 && test -d $REMOTO/data" 2>/dev/null; then break; fi
  [ "$i" = 40 ] && { echo "servidor não respondeu"; exit 1; }
  sleep 10
done

echo "== Enviando arquivos"
tar -C "$RAIZ/finora-app/dist/finora-app/browser" -czf "$PASTA/.site.tgz" .
scp "${SSH_OPTS[@]}" -q "$JAR" "$DESTINO:$REMOTO/api/finora-api.jar.novo"
scp "${SSH_OPTS[@]}" -q "$PASTA/.site.tgz" "$PASTA/docker-compose.yml" "$PASTA/Caddyfile" "$DESTINO:$REMOTO/"
rm -f "$PASTA/.site.tgz"

echo "== Subindo no servidor"
ssh "${SSH_OPTS[@]}" "$DESTINO" bash -s -- "$SITE_HOST" <<'REMOTO_SCRIPT'
set -euo pipefail
cd /opt/finora
SITE_HOST="$1"

# .env só é criado na primeira vez: segredo do JWT aleatório; SMTP fica em branco (link vai para o log)
if [ ! -f .env ]; then
  umask 077
  cat > .env <<EOF
SITE_HOST=$SITE_HOST
APP_FRONT_URL=https://$SITE_HOST
APP_JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
# SMTP (Brevo, SES...): tire o # das linhas, preencha e rode: docker compose up -d api
# Sem MAIL_HOST o e-mail não sai e o link de redefinição aparece em: docker compose logs api
#MAIL_HOST=smtp-relay.brevo.com
#MAIL_PORT=587
#MAIL_USERNAME=
#MAIL_PASSWORD=
#MAIL_REMETENTE=Finora <seu-remetente-validado@...>
EOF
  echo "   .env criado"
fi

# Atualiza o conteúdo das pastas no lugar (os containers montam as pastas, não os arquivos)
find site -mindepth 1 -delete && tar -C site -xzf .site.tgz && rm .site.tgz
mv -f api/finora-api.jar.novo api/finora-api.jar

docker compose pull -q
docker compose up -d --remove-orphans
docker compose restart api caddy >/dev/null
docker image prune -f >/dev/null
REMOTO_SCRIPT

echo "== Conferindo (a API leva uns segundos para subir)"
for i in $(seq 1 30); do
  CODIGO=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://$SITE_HOST/api/auth/signin" -H 'Content-Type: application/json' -d '{}' || true)
  if [ "$CODIGO" = "422" ] || [ "$CODIGO" = "400" ] || [ "$CODIGO" = "401" ]; then
    echo "   no ar: https://$SITE_HOST"
    exit 0
  fi
  sleep 5
done
echo "   ainda não respondeu (último código: $CODIGO). Veja os logs: ssh -i $CHAVE $DESTINO 'cd /opt/finora && docker compose logs --tail 50'"
exit 1
