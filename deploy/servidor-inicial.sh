#!/bin/bash
# Preparação do servidor (Ubuntu 24.04), roda uma vez na criação da EC2 (user-data).
# Instala Docker + Compose, cria 1 GB de swap (a t3.micro tem só 1 GB de RAM) e a pasta do Finora.
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y docker.io docker-compose-v2
systemctl enable --now docker
usermod -aG docker ubuntu

if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

mkdir -p /opt/finora/api /opt/finora/site /opt/finora/data
chown -R ubuntu:ubuntu /opt/finora

# Atualizações de segurança automáticas
apt-get install -y unattended-upgrades
