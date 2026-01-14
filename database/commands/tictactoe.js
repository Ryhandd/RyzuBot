<<<<<<< HEAD
module.exports = {
    name: "tictactoe",
    alias: ["ttt", "ttc"],
    execute: async ({ ryzu, from, sender, msg, mentionUser = [], reply, prefix, command }) => {
        // mentionUser = [] di atas itu buat jaga-jaga biar gak error length kalau kosong
        
        ryzu.ttt = ryzu.ttt ? ryzu.ttt : {};

        // Cek jika user sedang main
        if (ryzu.ttt[from]) return reply("Mainkan dulu game yang ada di grup ini atau tunggu selesai!");

        // FIX: Cek mentionUser
        if (!mentionUser || mentionUser.length === 0) return reply(`Tag lawan! Contoh: ${prefix + command} @tag`);
        
        let lawan = mentionUser[0];
        
        if (lawan === sender) return reply("Masa main sama diri sendiri, anj?");
        if (lawan === ryzu.user.id) return reply("Bot nggak mau main, lagi sibuk!");

        let id = from;
        let room = {
            id,
            p1: sender,
            p2: lawan,
            board: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            turn: sender,
            status: "PLAYING"
        };

        const renderBoard = (b) => {
            let res = "";
            for (let i = 0; i < 9; i++) {
                let cell = b[i];
                if (cell === "X") res += "❌";
                else if (cell === "O") res += "⭕";
                else res += "⬜";
                if ((i + 1) % 3 === 0) res += "\n";
            }
            return res;
        };

        ryzu.ttt[id] = room;

        let teks = `🎮 *TIC TAC TOE*\n\n`;
        teks += `❌ @${sender.split('@')[0]}\n`;
        teks += `⭕ @${lawan.split('@')[0]}\n\n`;
        teks += renderBoard(room.board);
        teks += `\nGiliran: @${room.turn.split('@')[0]}\n`;
        teks += `Ketik angka *1-9* untuk mengisi.`;

        return ryzu.sendMessage(from, { text: teks, mentions: [sender, lawan] }, { quoted: msg });
    }
=======
module.exports = {
    name: "tictactoe",
    alias: ["ttt", "ttc"],
    execute: async ({ ryzu, from, sender, msg, mentionUser = [], reply, prefix, command }) => {
        // mentionUser = [] di atas itu buat jaga-jaga biar gak error length kalau kosong
        
        ryzu.ttt = ryzu.ttt ? ryzu.ttt : {};

        // Cek jika user sedang main
        if (ryzu.ttt[from]) return reply("Mainkan dulu game yang ada di grup ini atau tunggu selesai!");

        // FIX: Cek mentionUser
        if (!mentionUser || mentionUser.length === 0) return reply(`Tag lawan! Contoh: ${prefix + command} @tag`);
        
        let lawan = mentionUser[0];
        
        if (lawan === sender) return reply("Masa main sama diri sendiri, anj?");
        if (lawan === ryzu.user.id) return reply("Bot nggak mau main, lagi sibuk!");

        let id = from;
        let room = {
            id,
            p1: sender,
            p2: lawan,
            board: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            turn: sender,
            status: "PLAYING"
        };

        const renderBoard = (b) => {
            let res = "";
            for (let i = 0; i < 9; i++) {
                let cell = b[i];
                if (cell === "X") res += "❌";
                else if (cell === "O") res += "⭕";
                else res += "⬜";
                if ((i + 1) % 3 === 0) res += "\n";
            }
            return res;
        };

        ryzu.ttt[id] = room;

        let teks = `🎮 *TIC TAC TOE*\n\n`;
        teks += `❌ @${sender.split('@')[0]}\n`;
        teks += `⭕ @${lawan.split('@')[0]}\n\n`;
        teks += renderBoard(room.board);
        teks += `\nGiliran: @${room.turn.split('@')[0]}\n`;
        teks += `Ketik angka *1-9* untuk mengisi.`;

        return ryzu.sendMessage(from, { text: teks, mentions: [sender, lawan] }, { quoted: msg });
    }
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
};