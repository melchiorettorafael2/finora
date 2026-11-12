#!/bin/bash
# Abre o console do H2 de produção NA SUA MÁQUINA, por túnel SSH (nada fica exposto na internet).
# Uso (Git Bash, na raiz do projeto):  bash deploy/h2-console.sh
# Depois abra http://localhost:8082/h2-console  ·  JDBC URL: jdbc:h2:file:/data/finora-db  ·  usuário sa / senha sa
# Ctrl+C fecha o túnel. Requer H2_CONSOLE=true no /opt/finora/.env do servidor.
set -euo pipefail
PASTA="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
source "$PASTA/.servidor"
PORTA_LOCAL="${1:-8082}"

echo "Túnel aberto: http://localhost:$PORTA_LOCAL/h2-console"
echo "  JDBC URL : jdbc:h2:file:/data/finora-db"
echo "  Usuário  : sa    Senha: sa"
echo "Cuidado: é o banco de PRODUÇÃO (UPDATE/DELETE valem de verdade). Ctrl+C para fechar."
ssh -N -i "$CHAVE" -o ExitOnForwardFailure=yes -L "$PORTA_LOCAL:127.0.0.1:8080" "ubuntu@$IP"
