module.exports = {
    name: "tictactoe",
    alias: ["ttt", "ttc"],
    execute: async ({ ryzu, from, sender, msg, mentionUser = [], reply, prefix, command }) => {
        
        if (!ryzu.ttt) ryzu.ttt = {};
        if (!ryzu.ttt[from]) ryzu.ttt[from] = {};

        if (!mentionUser || mentionUser.length === 0) return reply(`Tag lawan! Contoh: ${prefix + command} @tag`);
        
        let lawan = mentionUser;
        
        if (lawan === sender) return reply("Masa main sama diri sendiri?");
        if (lawan === ryzu.user?.id) return reply("Bot nggak mau main, lagi sibuk!");

        let activeRooms = Object.values(ryzu.ttt[from]);
        let isAlreadyPlaying = activeRooms.find(room => 
            room.p1 === sender || room.p2 === sender || 
            room.p1 === lawan || room.p2 === lawan
        );

        if (isAlreadyPlaying) {
            return reply("❌ Kamu atau lawanmu masih dalam pertandingan TicTacToe yang belum selesai!");
        }

        let teks = `🎮 *TIC TAC TOE*\n\n`;
        teks += `❌ @${sender.split('@')}\n`;
        teks += `⭕ @${lawan.split('@')}\n\n`;
        teks += `⬜⬜⬜\n⬜⬜⬜\n⬜⬜⬜\n\n`;
        teks += `Giliran: @${sender.split('@')}\n`;
        teks += `Balas/Reply pesan ini dengan angka *1-9* untuk mengisi.`;

        let kirimSoal = await ryzu.sendMessage(from, { text: teks, mentions: [sender, lawan] }, { quoted: msg });

        ryzu.ttt[from][kirimSoal.key.id] = {
            id: kirimSoal.key.id,
            p1: sender,
            p2: lawan,
            board: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            turn: sender,
            status: "PLAYING"
        };
    }
};