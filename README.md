# 🤖 Ryzu WhatsApp Bot

RyzuBot adalah WhatsApp Bot multi-fungsi berkinerja tinggi berbasis **Baileys (`@whiskeysockets/baileys`)** yang menyajikan berbagai fitur interaktif seperti RPG & Ekonomi, Game Seru, Game Werewolf Multiplayer, Pencarian Media (Pinterest, YouTube, dll), dan terintegrasi dengan sinkronisasi sesi Cloud ke MongoDB.

---

## 🛠️ Persyaratan Sistem
- **Node.js**: Versi `v18.x` atau lebih tinggi
- **MongoDB**: Untuk pencadangan & sinkronisasi sesi secara otomatis
- **FFmpeg**: Diperlukan untuk memproses media (audio/video/sticker)
- **Akun WhatsApp**: Berfungsi sebagai nomor bot

---

## 🔑 Konfigurasi Environment (`.env`)

Buat berkas `.env` di root direktori proyek Anda dan isi variabel berikut:

```env
# --- KONEKSI DATABASE ---
MONGO_URI=mongodb+srv://... # String koneksi MongoDB Anda

# --- KONFIGURASI WHATSAPP BOT ---
BOT_NUMBER=628xxxxxxxxx # Nomor WhatsApp utama bot (wajib menggunakan kode negara, tanpa '+' / 'spasi')
OWNER_NUMBERS=628xxxxxxxxx,628yyyyyyyyy # Daftar nomor WhatsApp owner (pisahkan dengan koma jika lebih dari satu)
LOGIN_METHOD= # Opsi: 'qr', 'pairing', atau kosongkan untuk memilih interaktif di terminal

# --- AI & TRANSLATE API KEYS ---
HF_TOKEN= # Hugging Face Token (untuk fitur AI pendukung)
OPENAI_API_KEY= # OpenAI API Key
GROQ_API_KEY= # Groq API Key
OPENROUTER_API_KEY= # OpenRouter API Key
DEEPSEEK_API_KEY= # DeepSeek API Key

# --- VOICE & AUDIO GENERATOR ---
ELEVENLABS_API_KEY= # ElevenLabs API Key (untuk Text-to-Speech)
VOICE_ID= # ElevenLabs Voice ID (contoh: GrxM8OEUWBzyFR2xP2Qd)

# --- DOWNLOADER & UTILITY APIS ---
BETABOTZ_KEY= # API Key dari api.betabotz.eu.org (untuk ytmp3, ytmp4, dll)
ONEPUNYA_KEY= # API Key dari Onepunya API
VELIXS_KEY= # API Key dari api.velixs.com (untuk ID Game Checker)
```

> [!IMPORTANT]
> - Jika menggunakan `LOGIN_METHOD=pairing`, pastikan `BOT_NUMBER` telah diisi dengan benar di berkas `.env` karena bot akan menggunakan nomor tersebut untuk meminta kode pairing ke WhatsApp.

---

## 🚀 Panduan Deployment

Pilih metode deployment yang sesuai dengan infrastruktur Anda:

### 1. 💻 Local Deployment (Windows / Linux / macOS)
Untuk menjalankan bot di komputer lokal atau Virtual Private Server (VPS) secara manual:

1. **Unduh & Pasang FFmpeg**:
   - **Windows**: Unduh FFmpeg dari situs resmi, ekstrak, dan masukkan direktori `bin` ke dalam *System Environment Variables (PATH)*.
   - **Linux (Ubuntu/Debian)**: Jalankan `sudo apt update && sudo apt install ffmpeg -y`.
   - **macOS**: Jalankan `brew install ffmpeg`.
2. **Instal Dependensi**:
   Jalankan perintah berikut di terminal/command prompt:
   ```bash
   npm install
   ```
3. **Mulai Bot**:
   Jalankan bot menggunakan perintah:
   ```bash
   npm start
   ```

---

### 2. 🎛️ Pterodactyl Panel (Shared Hosting / Bot Hosting)
Pterodactyl sangat populer digunakan untuk menjalankan bot secara 24/7 di layanan hosting bot:

1. **Persiapkan File**:
   - Kompres seluruh isi folder `RyzuBot` ke dalam format `.zip` (kecuali folder `node_modules` dan `.env` lokal).
   - Masuk ke File Manager di panel Pterodactyl Anda, unggah berkas `.zip` tersebut, lalu ekstrak.
2. **Konfigurasi Environment**:
   - Buat berkas baru bernama `.env` menggunakan fitur editor di panel File Manager.
   - Salin isi dari konfigurasi environment di atas dan isi nilainya.
3. **Konfigurasi Startup**:
   - Masuk ke tab **Startup** di Pterodactyl.
   - Pastikan **JS File / Entrypoint** diatur ke `index.js`.
   - Jika ada variabel `Metode Login` di startup panel, sesuaikan atau biarkan bot membaca dari `.env`.
4. **Instalasi Dependensi**:
   - Masuk ke tab **Console** lalu klik tombol **Start**. 
   - Sebagian besar *Egg* Node.js pada Pterodactyl akan mendeteksi `package.json` secara otomatis dan melakukan `npm install` sebelum menjalankan bot.
   - Jika bot gagal berjalan karena dependensi hilang, klik tombol **Reinstall** pada menu pengaturan server Pterodactyl Anda.
5. **Koneksi WhatsApp**:
   - Lihat konsol Pterodactyl Anda. QR Code (ASCII) atau Pairing Code akan tercetak di log konsol. Gunakan kode tersebut untuk menautkan perangkat WhatsApp Anda.

---

### 3. 🚂 Railway Deployment (Cloud Platform)
Untuk men-deploy bot tanpa server fisik menggunakan Railway:

1. **Hubungkan dengan GitHub**:
   Buat repositori pribadi (*private repository*) di GitHub Anda dan unggah seluruh berkas proyek `RyzuBot` (pastikan `node_modules` dan `.env` masuk ke dalam `.gitignore`).
2. **Buat Project di Railway**:
   - Masuk ke dashboard Railway, pilih **New Project** -> **Deploy from GitHub repo**.
   - Pilih repositori `RyzuBot` Anda.
3. **Tambahkan Database MongoDB (Opsional jika sudah ada)**:
   - Anda bisa menambahkan layanan MongoDB bawaan dari Railway atau menggunakan MongoDB Atlas eksternal.
4. **Konfigurasi Variabel Lingkungan (Variables)**:
   - Masuk ke tab **Variables** di Railway.
   - Masukkan seluruh isi dari berkas `.env` satu per satu sebagai key-value (terutama `MONGO_URI`, `OWNER_NUMBERS`, `BOT_NUMBER`, dll).
   - Atur `LOGIN_METHOD` menjadi `qr` atau `pairing`.
5. **Proses Deploy**:
   - Railway akan mendeteksi berkas `Procfile` secara otomatis (`worker: node index.js`) dan menjalankan bot di latar belakang.
   - Buka tab **Deployments** -> **View Logs** untuk melihat proses *generate* QR Code atau Pairing Code untuk ditautkan ke WhatsApp Anda.

---

## 💾 Manajemen Sesi (Cloud Sync)

RyzuBot dilengkapi dengan sinkronisasi sesi berbasis cloud yang sangat andal:
- **Pencadangan Otomatis**: Setiap kali ada pembaruan sesi (seperti pergantian kunci enkripsi dari Baileys), bot akan mencadangkan folder sesi (`RyzuSesi`) langsung ke database MongoDB.
- **Pemulihan Otomatis**: Jika Anda berpindah server, melakukan *redeploy*, atau folder `RyzuSesi` di lokal terhapus, bot akan mengunduh dan memulihkan sesi dari MongoDB saat startup. Anda tidak perlu melakukan scan ulang QR Code.

---

## 📋 Fitur Utama & Perintah

### ⚔️ RPG & Ekonomi
- **Registrasi & Profil**: `.register`, `.me`, `.limit`, `.kolam`.
- **Aktivitas RPG**: `.adventure`, `.mining`, `.fishing`, `.hunt`, `.heal`.
- **Kerajinan & Perlengkapan**: `.craft`, `.upgrade`, `.repair`, `.equipment`, `.buff`.
- **Ekonomi & Toko**: `.money`, `.shop`, `.buy`, `.sell`, `.tf`, `.invest`, `.tarik`.
- **Kriminal & Peringkat**: `.maling`, `.rampok`, `.top`.
- **Hadiah & Lotre**: `.open`, `.daily`, `.weekly`, `.monthly`, `.yearly`, `.lotre`.

### 🎲 Game Interaktif & Werewolf Multiplayer
- **Multiplayer**: `.tictactoe`, `.suit`, `.family100`.
- **Tebak-tebakan**: `.tebakgambar`, `.tebakgenshin`, `.tebakcharanime`, `.tebakheromlbb`, `.tekateki`, `.asahotak`.
- **Kasino & Klasik**: `.math`, `.judi`, `.slot`, `.chess`.
- **Werewolf Room**: `.ww join`, `.ww start`, `.ww info`, `.ww cektim`, `.ww kill`, `.ww protect`, `.ww ramal`, `.ww vote`, `.ww next`, `.ww out`, `.ww reset`, `.ww leaderboard`, `.cekrole`.

### 🔮 Fitur Lainnya
- **Sistem Gacha**: `.gacha`, `.gacha 10`, `.gachainfo`, `.gachadex`, `.buy gacha_ticket`.
- **Pencarian Media**: `.pinterest <query>`, `.neko`, `.waifu`, `.meme`, `.darkjokes`.
- **Downloader**: Pengunduhan media langsung dari YouTube (audio `.play`/`.ytmp3` & video `.ytmp4`), TikTok (termasuk audio track asli), dan Instagram.
