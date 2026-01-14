module.exports = {
    name: "rampok",
    alias: ["merampok"],
    desc: "Merampok bank dengan risiko tinggi",
    async execute(ctx) {
        const { sender, reply, args, funcs } = ctx
        funcs.checkUser(sender)
        let user = global.rpg[sender]

        let nominal = parseInt(args[0])
        if (!nominal || nominal < 1000)
            return reply("❌ Contoh: *.rampok 100000*\nMinimal Rp1.000")

        // === CEK LIMIT ===
        if (!user.premium && user.limit < 1)
            return reply("❌ Limit kamu habis")

        const now = Date.now()
        const CD_NORMAL = 60 * 60 * 1000
        const CD_PENJARA = 3 * 60 * 60 * 1000

        // cooldown khusus rampok bank
        if (user.lastRampok && now < user.lastRampok)
            return reply("⏳ Kamu masih dalam pelarian setelah merampok bank.")

        // === POTONG LIMIT ===
        if (!user.premium) user.limit -= 1

        // === CHANCE SUKSES ===
        let successChance =
            nominal <= 10000 ? 100 :
            nominal <= 100000 ? 75 :
            nominal <= 1000000 ? 50 :
            nominal <= 10000000 ? 25 : 10

        // === CHANCE KEGEP POLISI ===
        let policeChance =
            nominal <= 10000 ? 5 :
            nominal <= 100000 ? 50 :
            nominal <= 500000 ? 75 :
            nominal <= 1000000 ? 99 : 100

        let roll = Math.random() * 100
        let policeRoll = Math.random() * 100

        // === KETANGKAP POLISI ===
        if (policeRoll < policeChance) {
            let persen = Math.floor(Math.random() * 31) + 20
            let sita = Math.floor(nominal * persen / 100)

            user.money = Math.max(0, user.money - sita)
            user.lastRampok = now + CD_PENJARA

            return reply(
`🚓 *RAMP0K BANK GAGAL!*
Alarm bank berbunyi, polisi datang!

💸 Uang disita: Rp${sita.toLocaleString()} (${persen}%)
⛓️ Penjara: 3 Jam

📜 *NASIHAT*
_"Keserakahan membuka pintu kejahatan,
dan kejahatan membuka pintu penjara."_`
            )
        }

        // === GAGAL TANPA KETANGKAP ===
        if (roll > successChance) {
            user.lastRampok = now + CD_NORMAL
            return reply(
`❌ *RAMP0K BANK GAGAL*
Sistem keamanan bank terlalu ketat.
Kamu kabur tanpa hasil.

📜 *NASIHAT*
_"Tidak semua pintu bisa dibuka
dengan keberanian semata."_`
            )
        }

        // === SUKSES ===
        user.money += nominal
        user.lastRampok = now + CD_NORMAL

        reply(
`🏦💥 *RAMP0K BANK BERHASIL*
Kamu berhasil membobol brankas!

💰 Hasil: Rp${nominal.toLocaleString()}

📜 *NASIHAT*
_"Harta yang didapat dengan kekerasan
takkan pernah memberi rasa aman."_`
        )
    }
}
