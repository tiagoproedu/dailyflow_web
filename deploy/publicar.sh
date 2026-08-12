#!/usr/bin/env bash
#
# Publica o DailyFlow no servidor caseiro (fibbo-server, via Tailscale).
# Uso:  ./deploy/publicar.sh
#
set -euo pipefail

SERVIDOR=footy
DESTINO='~/dailyflow-app'
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# O Node fica no nvm e não está no PATH padrão
export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"

echo "==> Compilando o frontend"
cd "$RAIZ/frontend"
npm run build

echo "==> Enviando arquivos para $SERVIDOR"
cd "$RAIZ"
ssh "$SERVIDOR" "mkdir -p $DESTINO/backend $DESTINO/dist && rm -rf $DESTINO/backend/* $DESTINO/dist/*"

# O servidor não tem rsync, então vai por tar sobre ssh.
# .env nunca é enviado: o de produção vive só no servidor.
tar czf - --exclude=node_modules --exclude='.env' --exclude='.env.*' --exclude='.git' \
    -C backend . | ssh "$SERVIDOR" "tar xzf - -C $DESTINO/backend"
tar czf - -C frontend/dist . | ssh "$SERVIDOR" "tar xzf - -C $DESTINO/dist"
tar czf - -C deploy Caddyfile compose.yaml | ssh "$SERVIDOR" "tar xzf - -C $DESTINO"

echo "==> Aplicando migrations e subindo os containers"
ssh "$SERVIDOR" "cd $DESTINO && docker compose up -d --build && \
  docker compose run --rm api npx prisma migrate deploy"

echo "==> Publicado: https://fibbo-server.tail1b8792.ts.net"
