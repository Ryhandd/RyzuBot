const responses = [
  "Hasil dihitung pakai rumus yang bahkan Einstein gak ngerti",
  "Berdasarkan bisikan angin dan firasat bot",
  "Server kami hampir overheat menghitung ini",
  "Hasilnya sudah disetujui oleh dewan netizen",
  "Dihitung pakai kalkulator warung sebelah",
  "Data diambil dari mimpi semalam",
  "Hasil ini 100% akurat menurut perasaan bot",
  "Algoritma kami nangis pas ngitung ini",
  "Dikonfirmasi oleh kucing tetangga",
  "Hasilnya keluar setelah bot merenung cukup lama",
  "Dihitung sambil ngopi dan overthinking",
  "Server sempat error lalu pasrah",
  "Berdasarkan aura yang terdeteksi dari kejauhan",
  "Hasilnya muncul begitu saja tanpa penjelasan",
  "Ini sudah hasil terbaik yang bisa diberikan semesta",
  "Hasilnya sempat berubah 3 kali sebelum diputuskan",
  "Bot hampir tidak ingin mengungkapkan ini",
  "Dihitung pakai metode yang dirahasiakan pemerintah",
  "Server kami sempat mempertanyakan hidup",
  "Angka ini muncul tanpa izin siapa pun",
  "Ini hasil dari eksperimen yang tidak disengaja",
  "Dihitung menggunakan logika yang sudah pensiun",
  "Bot sempat ragu tapi akhirnya menyerah",
  "Ini hasil kompromi antara fakta dan halu",
  "Angka ini ditemukan, bukan dihitung",
  "Sistem kami mencoba kabur saat memproses ini",
  "Dihitung pakai perasaan, bukan angka",
  "Hasil ini lolos sensor internal bot",
  "Kami juga tidak yakin, tapi ini dia hasilnya",
  "Angka ini muncul setelah bot menatap layar kosong",
  "Dihitung dengan bantuan kekuatan yang tidak dijelaskan",
  "Hasil ini muncul sebelum proses dimulai",
  "Bot mempertaruhkan reputasinya untuk hasil ini",
  "Ini angka terakhir sebelum sistem menyerah total",
  "Hasil ini datang dengan sendirinya, kami cuma menerima"
]

module.exports = {
  name: "seberapagay",
  alias: ["gay"],

  execute: async ({ q, reply }) => {
    let persen = Math.floor(Math.random() * 101)

    if (persen > 90) persen = 90 + Math.floor(Math.random() * 10)

    const note = responses[Math.floor(Math.random() * responses.length)]

    return reply(
      `🏳️‍🌈 *SEBERAPA GAY*\n\n` +
      `${q ? `Target: *${q}*\n` : ""}` +
      `Hasil: *${persen}%*\n` +
      `_(${note})_`
    )
  }
}