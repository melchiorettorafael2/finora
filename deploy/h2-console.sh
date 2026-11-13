#!/bin/bash
# Abre, NA SUA MÁQUINA, o acesso ao H2 de produção por túnel SSH (nada fica exposto na internet):
#   - console web : http://localhost:8082/h2-console
#   - DBeaver     : driver "H2 Server", URL jdbc:h2:tcp://localhost:9092//data/finora-db
# Uso (Git Bash, na raiz do projeto):  bash deploy/h2-console.sh
# Ctrl+C fecha o túnel. Requer H2_CONSOLE=true no /opt/finora/.env do servidor.
set -euo pipefail
PASTA="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
source "$PASTA/.servidor"

echo "Túnel aberto para o H2 de PRODUÇÃO (UPDATE/DELETE valem de verdade). Ctrl+C para fechar."
echo "  Console web : http://localhost:8082/h2-console"
echo "  DBeaver     : H2 Server · jdbc:h2:tcp://localhost:9092//data/finora-db"
echo "  JDBC URL no console: jdbc:h2:file:/data/finora-db"
echo "  Usuário sa · Senha sa"
ssh -N -i "$CHAVE" -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 \
    -L 8082:127.0.0.1:8080 \
    -L 9092:127.0.0.1:9092 \
    "ubuntu@$IP"
