#!/bin/bash
# Cria a infraestrutura do Finora na AWS (uma vez): chave SSH, firewall, EC2 Ubuntu 24.04 e IP fixo.
# Uso (Git Bash, na raiz do projeto):  bash deploy/aws-criar-servidor.sh
# Precisa da AWS CLI configurada com permissão de EC2. Grava o resultado em deploy/.servidor
set -euo pipefail

REGIAO="${AWS_REGION:-us-east-1}"
TIPO="${TIPO_INSTANCIA:-t3.micro}"
NOME="finora"
CHAVE="$HOME/.ssh/finora-aws.pem"
PASTA="$(cd "$(dirname "$0")" && pwd)"
export AWS_REGION="$REGIAO"

echo "== Chave SSH"
if [ ! -f "$CHAVE" ]; then
  mkdir -p "$HOME/.ssh"
  aws ec2 create-key-pair --key-name "$NOME" --key-type ed25519 \
    --query KeyMaterial --output text | tr -d '\r' > "$CHAVE"   # no Windows a CLI devolve CRLF e o ssh recusa
  chmod 600 "$CHAVE"
  echo "   chave salva em $CHAVE (guarde: sem ela não dá para entrar no servidor)"
else
  echo "   já existe: $CHAVE"
fi

echo "== Firewall (security group)"
VPC=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query "Vpcs[0].VpcId" --output text)
SG=$(aws ec2 describe-security-groups --filters Name=group-name,Values="$NOME" Name=vpc-id,Values="$VPC" \
  --query "SecurityGroups[0].GroupId" --output text)
if [ "$SG" = "None" ]; then
  SG=$(aws ec2 create-security-group --group-name "$NOME" --description "Finora: web publico, SSH so do meu IP" \
    --vpc-id "$VPC" --query GroupId --output text)
  MEU_IP=$(curl -s https://checkip.amazonaws.com | tr -d '[:space:]')
  aws ec2 authorize-security-group-ingress --group-id "$SG" --protocol tcp --port 22 --cidr "$MEU_IP/32" >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG" --protocol tcp --port 80 --cidr 0.0.0.0/0 >/dev/null
  aws ec2 authorize-security-group-ingress --group-id "$SG" --protocol tcp --port 443 --cidr 0.0.0.0/0 >/dev/null
  echo "   criado $SG (SSH liberado só para $MEU_IP)"
else
  echo "   já existe: $SG"
fi

echo "== Imagem Ubuntu 24.04"
AMI=$(aws ec2 describe-images --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" "Name=state,Values=available" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)
echo "   $AMI"

echo "== Servidor EC2 ($TIPO)"
INSTANCIA=$(aws ec2 describe-instances --filters Name=tag:Name,Values="$NOME" Name=instance-state-name,Values=pending,running,stopped \
  --query "Reservations[0].Instances[0].InstanceId" --output text)
if [ "$INSTANCIA" = "None" ]; then
  # A AWS CLI do Windows precisa do caminho no formato C:\...
  USER_DATA="$PASTA/servidor-inicial.sh"
  if command -v cygpath >/dev/null; then USER_DATA="$(cygpath -w "$USER_DATA")"; fi
  INSTANCIA=$(aws ec2 run-instances --image-id "$AMI" --instance-type "$TIPO" --key-name "$NOME" \
    --security-group-ids "$SG" \
    --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3","DeleteOnTermination":true}}]' \
    --user-data "file://$USER_DATA" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$NOME}]" \
    --metadata-options HttpTokens=required \
    --query "Instances[0].InstanceId" --output text)
  echo "   criado $INSTANCIA, aguardando ligar..."
  aws ec2 wait instance-running --instance-ids "$INSTANCIA"
else
  echo "   já existe: $INSTANCIA"
fi

echo "== IP fixo (Elastic IP)"
IP=$(aws ec2 describe-addresses --filters Name=tag:Name,Values="$NOME" --query "Addresses[0].PublicIp" --output text)
if [ "$IP" = "None" ]; then
  ALOC=$(aws ec2 allocate-address --domain vpc --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=$NOME}]" \
    --query AllocationId --output text)
  aws ec2 associate-address --instance-id "$INSTANCIA" --allocation-id "$ALOC" >/dev/null
  IP=$(aws ec2 describe-addresses --allocation-ids "$ALOC" --query "Addresses[0].PublicIp" --output text)
fi
HOST="$(echo "$IP" | tr '.' '-').sslip.io"

cat > "$PASTA/.servidor" <<EOF
INSTANCIA=$INSTANCIA
IP=$IP
SITE_HOST=$HOST
CHAVE=$CHAVE
EOF

echo
echo "Pronto: $INSTANCIA em $IP"
echo "Endereço: https://$HOST"
echo "Aguarde ~2 min (o servidor instala o Docker) e rode: bash deploy/deploy.sh"
