#!/usr/bin/env bash
# Pasang RyzuBot 24/7 di mesin InstaBox (Debian/Ubuntu).
# Jalankan di terminal InstaBox sebagai user biasa:
#   curl -fsSL https://raw.githubusercontent.com/Ryhandd/RyzuBot/main/instabox-install.sh | bash
#
# Aman dijalankan berulang. Tidak menyentuh .env yang sudah ada.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ryzubot}"
REPO_DIR="$APP_DIR/RyzuBot"
REPO_URL="https://github.com/Ryhandd/RyzuBot.git"
BRANCH="main"
SERVICE_NAME="ryzubot"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NODE_MAJOR="22"

log()  { printf '\033[1;36m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  command -v sudo >/dev/null 2>&1 || die "Butuh sudo atau root."
  SUDO="sudo"
  # Siapkan kredensial sudo SEKALI, di muka, sebelum skrip menyentuh /opt.
  # Setelah satu kali berhasil, 'sudo -n' berlaku untuk seluruh sisa skrip
  # sehingga tidak ada prompt berulang di tengah proses.
  if $SUDO -n true 2>/dev/null; then
    log "Akses sudo sudah aktif (tanpa password)."
  elif [ -r /dev/tty ] && ( : </dev/tty ) 2>/dev/null; then
    log "Meminta password sudo (dari terminal)..."
    if ! $SUDO -v </dev/tty; then
      die "Password sudo salah. Coba 'sudo -v' dulu, lalu ulangi skrip ini."
    fi
  else
    cat >&2 <<MSG
--------------------------------------------------------------------------------
 Akses sudo belum aktif dan tidak ada terminal untuk mengetik password.

 Langkah 1. Jalankan di terminal InstaBox:
     sudo -v

 Kalau langkah 1 ditolak ('Sorry, try again'), password akun 'user' memang
 tidak pernah diberikan oleh InstaBox. Langkah 2 gagal, gunakan Jalan C
 (tanpa sudo, di home directory).
--------------------------------------------------------------------------------
MSG
    exit 1
  fi
fi

need_sudo() {
  # Pintu cepat: kredensial sudo masih valid -> jalankan tanpa menyentuh stdin.
  if $SUDO -n true 2>/dev/null; then
    $SUDO "$@"
    return $?
  fi

  # Kredensial tidak ada. Sudo butuh terminal untuk mengetik password.
  # JANGAN pernah memberi sudo stdin dari pipe/heredoc: itu bisa membanjiri
  # password dengan sisa teks skrip ("cannot execute binary file").
  if [ -r /dev/tty ] && ( : </dev/tty ) 2>/dev/null; then
    if $SUDO -v </dev/tty; then
      $SUDO "$@"
      return $?
    fi
  fi

  cat >&2 <<MSG
[x] sudo butuh password, tapi ${SUDO} gagal tanpa terminal.
    Skrip tidak melanjutkan agar .env/service tidak terpasang setengah jadi.

    Jalankan perintah ini di terminal InstaBox (lalu ulangi):
      sudo -v

    Setelah password diterima, jalankan lagi skrip ini:
      bash /tmp/ryzu.sh
MSG
  exit 1
}

# ---------- 1. Dependensi sistem ----------
log "Memasang dependensi sistem (git, curl, nano, ffmpeg, build tools)..."
export DEBIAN_FRONTEND=noninteractive
need_sudo apt-get update -qq
need_sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  git curl nano ca-certificates ffmpeg python3 make g++ >/dev/null

# ---------- 2. Node.js ----------
need_node="0"
if command -v node >/dev/null 2>&1; then
  cur="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$cur" -lt "$NODE_MAJOR" ] && need_node="1"
else
  need_node="1"
fi

if [ "$need_node" = "1" ]; then
  log "Memasang Node.js ${NODE_MAJOR}.x..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" -o /tmp/nodesource_setup.sh
  need_sudo bash /tmp/nodesource_setup.sh >/dev/null
  need_sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs >/dev/null
  rm -f /tmp/nodesource_setup.sh
fi
log "Node $(node -v) | npm $(npm -v)"

# ---------- 3. Repo ----------
need_dir() {
  if [ ! -d "$APP_DIR" ]; then
    need_sudo mkdir -p "$APP_DIR"
  fi
  if [ "$(stat -c '%U' "$APP_DIR")" != "$(id -un)" ]; then
    need_sudo chown -R "$(id -u):$(id -g)" "$APP_DIR"
  fi
}
need_dir

if [ -d "$REPO_DIR/.git" ]; then
  log "Memperbarui repo di $REPO_DIR..."
  git -C "$REPO_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$REPO_DIR" reset --hard "origin/$BRANCH"
else
  if [ -d "$REPO_DIR" ] && [ -n "$(ls -A "$REPO_DIR" 2>/dev/null)" ]; then
    die "$REPO_DIR sudah ada tapi bukan repo git. Pindahkan/hapus dulu."
  fi
  log "Meng-clone repo ke $REPO_DIR..."
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$REPO_DIR"
fi

# ---------- 4. .env ----------
if [ ! -f "$REPO_DIR/.env" ]; then
  cp "$REPO_DIR/.env.example" "$REPO_DIR/.env"
  chmod 600 "$REPO_DIR/.env"
  warn ".env belum diisi. Ada dua cara mengisi:"
  warn "  1) Tanpa editor (disarankan):"
  warn "       bash $REPO_DIR/set-env.sh"
  warn "  2) Pakai nano:"
  warn "       nano $REPO_DIR/.env"
  warn "Setelah itu jalankan skrip ini lagi (aman diulang)."
  exit 0
fi
chmod 600 "$REPO_DIR/.env"

if grep -q '628xxxxxxxxxx' "$REPO_DIR/.env"; then
  die ".env masih berisi placeholder (628xxxxxxxxxx). Jalankan: bash $REPO_DIR/set-env.sh"
fi
if grep -q 'bwr_live_xxxxxxxx' "$REPO_DIR/.env"; then
  die ".env: AI_API_KEY masih placeholder. Jalankan: bash $REPO_DIR/set-env.sh"
fi
if grep -q 'mongodb+srv://user:pass@' "$REPO_DIR/.env"; then
  die ".env: MONGO_URI masih placeholder. Jalankan: bash $REPO_DIR/set-env.sh"
fi

# ---------- 5. Dependensi node ----------
log "Memasang paket Node (butuh beberapa menit)..."
cd "$REPO_DIR"
if [ -f package-lock.json ]; then
  npm ci --omit=dev --no-audit --no-fund
else
  npm install --omit=dev --no-audit --no-fund
fi

# better-sqlite3 butuh binary yang cocok; kalau prebuild gagal, bangun dari sumber.
node -e "require('better-sqlite3')" 2>/dev/null || {
  warn "better-sqlite3 perlu dibangun ulang dari sumber (butuh ~2 menit)..."
  npm rebuild better-sqlite3 --build-from-source --no-audit --no-fund
}

# ---------- 6. Service ----------
log "Mendaftarkan service systemd '$SERVICE_NAME'..."
TMP_UNIT="$(mktemp)"
cat >"$TMP_UNIT" <<UNIT
[Unit]
Description=RyzuBot WhatsApp Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$(id -un)
WorkingDirectory=$REPO_DIR
ExecStart=$(command -v node) $REPO_DIR/index.js
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=20
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
MemoryMax=800M

[Install]
WantedBy=multi-user.target
UNIT

need_sudo cp "$TMP_UNIT" "$SERVICE_FILE"
rm -f "$TMP_UNIT"
need_sudo systemctl daemon-reload
need_sudo systemctl enable "$SERVICE_NAME" >/dev/null
need_sudo systemctl restart "$SERVICE_NAME"

sleep 4
if need_sudo systemctl is-active --quiet "$SERVICE_NAME"; then
  log "Service aktif. Menampilkan 40 baris log terakhir:"
  need_sudo journalctl -u "$SERVICE_NAME" -n 40 --no-pager || true
  echo
  log "StatuS: sudo systemctl status $SERVICE_NAME"  log "Log live: sudo journalctl -u $SERVICE_NAME -f"
  log "Restart: sudo systemctl restart $SERVICE_NAME"
  echo
  warn "Cari 'KODE PAIRING ANDA' di log, lalu masukkan di WhatsApp."
  warn "Setelah terhubung, pasang Uptime Robot ke http://<ip-mesin>:$PORT/health"
else
  die "Service gagal start. Lihat: sudo journalctl -u $SERVICE_NAME -n 80 --no-pager"
fi
