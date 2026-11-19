# Uptime Robot — cegah mesin InstaBox auto-pause

InstaBox mem-pause mesin kalau tidak ada trafik masuk (mis. saat tab web ditutup).
Uptime Robot memanggil URL bot kita tiap 5 menit, sehingga mesin dianggap aktif terus.

Bot sudah menyediakan dua endpoint:

| URL | Isi | Kode |
|---|---|---|
| `/healthz` | teks polos `OK bot=connected ws=open mongo=up uptime=123s` | 200 sehat / 503 bermasalah |
| `/health` | JSON lengkap (untuk dilihat manusia) | selalu 200 |

`/healthz` mengembalikan **503 + `FAIL ...`** kalau proses hidup tapi WhatsApp sudah
terputus. Jadi monitor bisa membedakan "server hidup" dan "bot benar-benar jalan".

---

## 1. Cek dulu dari luar mesin

Di terminal InstaBox:

```bash
curl -s ifconfig.me          # catat IP publik mesin
curl -s localhost:3000/healthz
```

Harus keluar `OK bot=...`. Kalau `Connection refused`, port belum terbuka —
pakai tab **Ports** di dashboard InstaBox dan catat domain/URL yang diberikan.

Uji dari HP (matikan WiFi, pakai data) buka `http://<ip-atau-domain>:3000/healthz`.
Kalau tidak terbuka, monitor eksternal juga tidak akan bisa — buka port-nya dulu
di dashboard InstaBox.

---

## 2. Daftar Uptime Robot

1. Buka https://uptimerobot.com → **Register** (pakai email, gratis).
2. Verifikasi email, lalu **Log in**.
3. Klik **+ Add New Monitor**.

Isi formulirnya:

- **Monitor Type**: `Keyword`
- **Friendly Name**: `RyzuBot`
- **URL (or IP)**: `http://<ip-atau-domain>:3000/healthz`
- **Keyword Type**: `exists`
- **Keyword**: `OK`
- **Monitoring Interval**: `5 minutes` (batas paket gratis)
- **Alert Contacts**: centang email kamu
- Klik **Create Monitor**.

> Kalau memilih tipe `HTTP(s)` biasa, monitor hanya tahu server menjawab.
> Tipe `Keyword` juga tahu bot sedang tersambung ke WhatsApp.

---

## 3. Pastikan berjalan

Tunggu 5–10 menit, lalu di dashboard Uptime Robot status monitor harus
**Up** dan grafiknya mulai terisi. Log di mesin bisa dilihat dengan:

```bash
sudo journalctl -u ryzubot -f
```

Kalau monitor **Down** padahal bot jalan:

1. `curl -s localhost:3000/healthz` di mesin — kalau `OK`, masalahnya di jaringan
   (port tertutup / IP berubah). Buka port di dashboard InstaBox.
2. Kalau `FAIL`, bot hidup tapi WhatsApp terputus. Cek log, cari `connection closed`
   atau `401/405` (perlu pairing ulang: `sudo systemctl restart ryzubot` lalu
   masukkan kode pairing baru).

---

## 4. Batas yang perlu diketahui

- Uptime Robot paket gratis: interval minimum **5 menit**, 50 monitor.
- Monitor hanya mencegah pause **selama mesin masih bisa dijangkau dari internet**.
  Kalau InstaBox mem-pause mesin dengan mematikan jaringan sepenuhnya, ping dari
  luar tidak akan membangunkan — yang bisa dilakukan hanya memastikan mesin
  tidak pernah idle cukup lama.
- `/healthz` hanya membaca status di memori, tidak mengirim apa pun ke WhatsApp,
  jadi aman dari deteksi spam.
