#!/usr/bin/env bash
# Isi /opt/ryzubot/RyzuBot/.env tanpa perlu editor teks.
# Jalankan di terminal InstaBox:
#   bash /opt/ryzubot/RyzuBot/set-env.sh
#
# Aman diulang: menanyakan ulang isian, lalu menulis ulang .env dari template.

set -uo pipefail

REPO_DIR="${REPO_DIR:-/opt/ryzubot/RyzuBot}"
ENV_FILE="$REPO_DIR/.env"
TEMPLATE="$REPO_DIR/.env.example"

[ -f "$TEMPLATE" ] || { echo "[x] Template tidak ada: $TEMPLATE"; exit 1; }

# Baca nilai lama (kalau .env sudah pernah diisi) supaya bisa ditekan Enter.
old() {
  [ -f "$ENV_FILE" ] || return 0
  awk -F= -v k="$1" '$1==k{sub(/^[^=]*=/,"");print;exit}' "$ENV_FILE"
}

# Tanya satu nilai. Enter = pakai nilai lama / default.
# Argumen: KEY "<label>" "<default>"
ask() {
  local key="$1" label="$2" def="$3" cur val
  cur="$(old "$key")"
  [ -n "$cur" ] && def="$cur"
  printf '%s\n  %s\n  [%s]: ' "" "$label" "$def" >&2
  IFS= read -r val || val=""
  [ -z "$val" ] && val="$def"
  printf '%s' "$val"
}

echo "=============================================="
echo " Isi konfigurasi RyzuBot"
echo " Tekan Enter untuk memakai nilai dalam [kurung]."
echo "=============================================="
echo

BOT_NUMBER="$(ask BOT_NUMBER "Nomor WhatsApp bot (angka saja, cth 628123456789)" "")"
OWNER_NUMBERS="$(ask OWNER_NUMBERS "Nomor owner, pisah koma (cth 628123456789,628987654321)" "$BOT_NUMBER")"
LOGIN_METHOD="$(ask LOGIN_METHOD "Metode login: pairing atau qr" "pairing")"
AI_API_KEY="$(ask AI_API_KEY "API key BangunWeb (diawali bwr_live_)" "")"
MONGO_URI="$(ask MONGO_URI "URI MongoDB (mongodb+srv://...)" "")"
PORT="$(ask PORT "Port keep-alive" "3000")"

# Bersihkan: buang spasi dan karakter non-angka pada nomor
BOT_NUMBER="$(printf '%s' "$BOT_NUMBER" | tr -cd '0-9')"
OWNER_NUMBERS="$(printf '%s' "$OWNER_NUMBERS" | tr -cd '0-9,')"
LOGIN_METHOD="$(printf '%s' "$LOGIN_METHOD" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z')"

errors=""
[ -z "$BOT_NUMBER" ] && errors+="  - BOT_NUMBER kosong\n"
[ -z "$AI_API_KEY" ] && errors+="  - AI_API_KEY kosong\n"
[ -z "$MONGO_URI" ] && errors+="  - MONGO_URI kosong\n"
case "$LOGIN_METHOD" in pairing|qr) ;; *) errors+="  - LOGIN_METHOD harus pairing atau qr\n" ;; esac

if [ -n "$errors" ]; then
  printf '\n[x] Belum lengkap:\n%s' "$errors" >&2
  exit 1
fi

# Tulis ulang .env dari template dengan nilai yang baru.
umask 077
tmp="$(mktemp)"
{
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      BOT_NUMBER=*)      printf 'BOT_NUMBER=%s\n' "$BOT_NUMBER" ;;
      OWNER_NUMBERS=*)   printf 'OWNER_NUMBERS=%s\n' "$OWNER_NUMBERS" ;;
      LOGIN_METHOD=*)    printf 'LOGIN_METHOD=%s\n' "$LOGIN_METHOD" ;;
      AI_API_KEY=*)      printf 'AI_API_KEY=%s\n' "$AI_API_KEY" ;;
      MONGO_URI=*)       printf 'MONGO_URI=%s\n' "$MONGO_URI" ;;
      PORT=*)            printf 'PORT=%s\n' "$PORT" ;;
      *)                 printf '%s\n' "$line" ;;
    esac
  done <"$TEMPLATE"
} >"$tmp"

mv "$tmp" "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo
echo "[ok] .env tersimpan di $ENV_FILE"
echo
echo "Ringkasan (nilai rahasia disensor):"
printf '  BOT_NUMBER    = %s\n' "$BOT_NUMBER"
printf '  OWNER_NUMBERS = %s\n' "$OWNER_NUMBERS"
printf '  LOGIN_METHOD  = %s\n' "$LOGIN_METHOD"
printf '  AI_API_KEY    = %s...%s\n' "$(printf '%s' "$AI_API_KEY" | cut -c1-9)" "$(printf '%s' "$AI_API_KEY" | rev | cut -c1-4 | rev)"
printf '  MONGO_URI     = %s***\n' "$(printf '%s' "$MONGO_URI" | cut -c1-22)"
printf '  PORT          = %s\n' "$PORT"
echo
echo "Langkah berikut:"
echo "  curl -fsSL https://raw.githubusercontent.com/Ryhandd/RyzuBot/main/instabox-install.sh | bash"
