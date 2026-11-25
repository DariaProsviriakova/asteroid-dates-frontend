#!/bin/sh
set -eu

ip=${1:-}
if ! node -e 'process.exit(require("node:net").isIPv4(process.argv[1]) ? 0 : 1)' "$ip"; then
  echo "Использование: npm run cert:lan -- <IPv4-адрес ноутбука>" >&2
  exit 1
fi

umask 077
cert_dir=certificates
mkdir -p "$cert_dir"
work=$(mktemp -d "$cert_dir/.tmp.XXXXXX")
trap 'rm -rf "$work"' EXIT

if [ ! -f "$cert_dir/ca.crt" ] && [ ! -f "$cert_dir/ca.key" ]; then
  openssl req -x509 -newkey rsa:3072 -nodes -sha256 -days 1825 \
    -keyout "$work/ca.key" -out "$work/ca.crt" -subj '/CN=Asteroid Dates Lab CA' \
    -addext 'basicConstraints=critical,CA:TRUE,pathlen:0' \
    -addext 'keyUsage=critical,keyCertSign,cRLSign'
  mv "$work/ca.key" "$work/ca.crt" "$cert_dir/"
fi

openssl req -new -newkey rsa:2048 -nodes -sha256 \
  -keyout "$work/cert.key" -out "$work/cert.csr" -subj "/CN=$ip"
cat > "$work/extensions.cnf" <<EOF
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$ip
EOF

openssl x509 -req -sha256 -days 365 -in "$work/cert.csr" \
  -CA "$cert_dir/ca.crt" -CAkey "$cert_dir/ca.key" -set_serial "0x$(openssl rand -hex 16)" \
  -extfile "$work/extensions.cnf" -out "$work/cert.crt"
openssl verify -CAfile "$cert_dir/ca.crt" -verify_ip "$ip" "$work/cert.crt"
mv "$work/cert.key" "$work/cert.crt" "$cert_dir/"
chmod 644 "$cert_dir/ca.crt" "$cert_dir/cert.crt"
echo "HTTPS для $ip. Сертификат CA для телефона: $cert_dir/ca.crt"
