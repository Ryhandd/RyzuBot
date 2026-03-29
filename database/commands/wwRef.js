// ============================================
// CONTOH IMPLEMENTASI & TESTING WEREWOLF GAME
// ============================================

/**
 * CARA IMPLEMENTASI:
 * 
 * 1. Copy werewolf-game.js ke folder commands kamu
 * 2. Pastikan bot sudah load command tersebut
 * 3. Gunakan perintah .ww di group chat
 */

// ============================================
// CONTOH FLOW GAME (Step by Step)
// ============================================

/*
PLAYER A: .ww join Alice
Bot: ✅ Berhasil join game!
     👥 Peserta sekarang: 1/10
     1. Alice
     
PLAYER B: .ww join Bob
Bot: ✅ Berhasil join game!
     👥 Peserta sekarang: 2/10
     1. Alice
     2. Bob
     
PLAYER C: .ww join Charlie
PLAYER D: .ww join Diana
PLAYER E: .ww join Eve

PLAYER A: .ww start
Bot: 🎮 *GAME DIMULAI!*
     
     🌅 FASE SIANG - HARI 1
     
     📋 Distribusi Role (Leader only):
     Alice: WEREWOLF
     Bob: VILLAGER
     Charlie: SEER
     Diana: GUARDIAN
     Eve: VILLAGER
     
     ℹ️ Gunakan perintah:
     .ww kill @user (Werewolf malam)
     .ww protect @user (Guardian malam)
     .ww ramal @user (Seer malam)
     .ww vote @user (Voting siang)
     .ww next (Lanjut ke fase berikutnya)

[Setiap pemain dapat Private Message dengan role mereka]

BOB (Villager): .ww vote @alice
Bot: ✅ Bob memilih Alice untuk dieliminasi.

CHARLIE (Seer): .ww vote @alice
DIANA: .ww vote @alice
EVE: .ww vote @bob

[Mayoritas vote Alice]

PLAYER A: .ww next
Bot: 🗳️ *HASIL VOTING*
     ━━━━━━━━━━━━━━━━━
     💀 Alice (WEREWOLF) dieliminasi!
     
     ━━━━━━━━━━━━━━━━━
     🌙 Memasuki FASE MALAM...

[Night phase - Private messages]
CHARLIE (Seer): .ww ramal @bob
Bot: ✅ Seer meramal: Bob
     [Private] 🔮 *HASIL RAMALAN HARI 1*
               ━━━━━━━━━━━━━━━━━
               👤 Bob adalah: *VILLAGER*
               ━━━━━━━━━━━━━━━━━

[Werewolf sudah mati, tidak bisa kill]

DIANA (Guardian): .ww protect @charlie
Bot: ✅ Guardian melindungi: Charlie

PLAYER A: .ww next
Bot: ☀️ *FASE SIANG - HARI 2*
     ━━━━━━━━━━━━━━━━━
     Silakan diskusi dan voting untuk eliminate seseorang.
     
     Gunakan .ww vote @user

[Game berlanjut...]

CHARLIE: Hmm, Bob adalah VILLAGER. Jadi dari 5 orang, Alice was WEREWOLF...
         Kita perlu cari werewolf yang lain [BLUFF]
         
BOB: Nah, kita suspicious siapa next?

[Voting phase 2]

DIANA: .ww vote @diana
CHARLIE: .ww vote @diana
EVE: .ww vote @charlie

Bot: 🗳️ *HASIL VOTING*
     ━━━━━━━━━━━━━━━━━
     💀 Diana (GUARDIAN) dieliminasi!
     
     ━━━━━━━━━━━━━━━━━
     🌙 Memasuki FASE MALAM...

[Night phase 2]

CHARLIE (Seer): .ww ramal @eve
Bot: ✅ Seer meramal: Eve
     [Private] 🔮 *HASIL RAMALAN HARI 2*
               ━━━━━━━━━━━━━━━━━
               👤 Eve adalah: *VILLAGER*
               ━━━━━━━━━━━━━━━━━

PLAYER A: .ww next
Bot: ☀️ *FASE SIANG - HARI 3*

[Game berlanjut...]

[Akhirnya semua villager mati karena hanya Alice jadi werewolf]

Bot: 🎉 *VILLAGER MENANG!* 🎉
     
     ✅ Werewolf telah berhasil dibasmi!
     Masing-masing villager dapat 20,000 Money!
*/

// ============================================
// STRUKTUR DATA INTERNAL
// ============================================

/*
ryzu.werewolf = {
    "GROUP_ID": {
        status: "waiting" | "playing" | "finished",
        day: 1,
        phase: "day" | "night",
        player: [
            {
                id: "62812xxxx@s.whatsapp.net",
                nickname: "Alice",
                role: "WEREWOLF",
                alive: true
            },
            {
                id: "62813xxxx@s.whatsapp.net",
                nickname: "Bob",
                role: "VILLAGER",
                alive: false
            }
        ],
        votes: {
            "62812xxxx@s.whatsapp.net": "62813xxxx@s.whatsapp.net" // voter: votedId
        },
        history: [
            {
                day: 1,
                phase: "day",
                event: "Alice (WEREWOLF) dieliminasi voting"
            }
        ],
        seerUsed: {
            1: true, // Seer sudah ramal hari 1
            2: true
        },
        guardianProtected: {
            1: "62814xxxx@s.whatsapp.net" // Orang yang dilindungi hari 1
        }
    }
}
*/

// ============================================
// ADVANCED FEATURES YANG BISA DITAMBAH
// ============================================

/*
FEATURE IDEAS:

1. Mafia Role (Seperti werewolf tapi 3 orang)
2. Doctor Role (Bisa heal orang yang habis di-vote)
3. Cop Role (Bisa check siapa werewolf dengan 50% akurat)
4. Priest Role (Bisa communicate dengan 1 orang per malam)
5. Cupid Role (Match 2 orang, jika salah satu mati, satunya juga ikut mati)
6. Witch Role (Bisa kill 1 orang atau save 1 orang per game)
7. Mute Role (Tidak boleh bicara saat siang)
8. Messenger Role (Bisa deliver message anonim)
9. Game Statistics (Win rate, total games, leaderboard)
10. Replay System (Rekam game untuk di-rewatch)
11. Anti-Cheat (Detect jika ada yang cheat/bocor role)
12. Scoring System (Poin berdasarkan aksi dalam game)
13. Difficulty Levels (Easy, Normal, Hard)
14. Tournament Mode (Multiple games, accumulative score)
15. Bot-Controlled NPCs (Jika pemain < 4, add bot)

TECHNICAL IMPROVEMENTS:
- Database untuk store user stats
- Redis untuk cache game data
- WebSocket untuk real-time updates
- Admin panel untuk manage games
- Anti-timeout untuk long games
- Voice notification untuk phase changes
- Image generation untuk game recap
- Emoji reactions untuk voting
- Inline buttons untuk easier UX
*/

// ============================================
// TESTING CHECKLIST
// ============================================

/*
✅ TEST CASES:

BASIC FLOW:
[ ] .ww join - Join game
[ ] .ww start - Start game dengan 4+ pemain
[ ] .ww cektim - Check semua pemain
[ ] .ww cekrole - Check role private chat
[ ] .ww info - Show role info

NIGHT ACTIONS:
[ ] .ww kill @user - Werewolf kill (hanya malam)
[ ] .ww protect @user - Guardian protect (hanya malam)
[ ] .ww ramal @user - Seer ramal (1x per hari)
[ ] Guardian tidak bisa protect 2x berturut-turut - CHECK
[ ] Seer hanya ramal 1x per hari - CHECK
[ ] Protected target tidak bisa di-kill - CHECK

DAY VOTING:
[ ] .ww vote @user - Vote eliminate (hanya siang)
[ ] Voting count otomatis - CHECK
[ ] Orang dengan vote terbanyak eliminate - CHECK

PHASE TRANSITION:
[ ] .ww next - Siang → Malam
[ ] .ww next - Malam → Siang (day++)
[ ] Reset votes setelah phase - CHECK
[ ] Reset seer usage di hari baru - CHECK

WIN CONDITION:
[ ] Werewolf win jika jumlah ≥ villager - CHECK
[ ] Villager win jika semua werewolf mati - CHECK
[ ] Farmer win jika hanya farmer yg alive - CHECK

EDGE CASES:
[ ] Game start dengan < 4 pemain - REJECT
[ ] Kill/Protect/Vote dengan format salah - REJECT
[ ] Action di phase yang salah - REJECT
[ ] Keluar game saat playing - REJECT
[ ] Multiple games di channel berbeda - ALLOW
*/

// ============================================
// COMMAND ALIAS & SHORTCUT
// ============================================

/*
MAIN COMMAND: .ww

ALIAS:
.werewolf join
.cekrole
.cektim
.wwstatus

SHORTCUT IDEAS:
.ww j [nama]        - join
.ww s               - start
.ww n               - next
.ww k @user         - kill
.ww p @user         - protect
.ww r @user         - ramal
.ww v @user         - vote
.ww o               - out
.ww res             - reset
.ww h               - help
*/

// ============================================
// DATABASE SCHEMA (Jika implementasi dengan DB)
// ============================================

/*
users:
- id (Primary Key)
- username
- level
- money
- ww_games_played
- ww_games_won
- ww_win_rate
- ww_last_role
- created_at
- updated_at

games:
- id (Primary Key)
- group_id
- status (finished | cancelled)
- winner (werewolf | villager)
- started_at
- ended_at
- total_days
- player_count

game_logs:
- id (Primary Key)
- game_id (Foreign Key)
- day
- phase
- event
- timestamp

player_stats:
- id (Primary Key)
- user_id (Foreign Key)
- game_id (Foreign Key)
- role
- is_alive
- reward_money
- reward_xp
- actions_count
- vote_count
*/

// ============================================
// ERROR HANDLING REFERENCE
// ============================================

/*
ERROR MESSAGES YANG SUDAH IMPLEMENTED:

1. "❌ Tidak ada game WW yang sedang berlangsung."
2. "❌ Kamu bukan peserta game ini."
3. "❌ Game sudah dimulai."
4. "Kamu sudah join."
5. "❌ Minimal 4 pemain untuk memulai."
6. "Game sudah jalan."
7. "Gada game jalan."
8. "❌ Hanya bisa kill di malam hari!"
9. "❌ Kamu bukan werewolf yang hidup."
10. "❌ Target tidak ditemukan."
11. "❌ Tidak bisa bunuh diri sendiri."
12. "❌ Target sudah mati."
13. "❌ Target dilindungi Guardian!"
14. "❌ Hanya bisa protect di malam hari!"
15. "❌ Kamu bukan guardian yang hidup."
16. "❌ Tidak bisa lindungi orang yang sama 2x berturut-turut!"
17. "❌ Hanya bisa ramal di malam hari!"
18. "❌ Kamu bukan seer yang hidup."
19. "❌ Kamu sudah ramal hari ini!"
20. "❌ Target tidak ditemukan."
21. "❌ Tidak bisa ramal diri sendiri."
22. "❌ Hanya bisa vote di siang hari!"
23. "❌ Tidak ada room."
24. "❌ Tidak bisa keluar saat game berlangsung."
*/

module.exports = { 
    name: "wwRef",
    command: ["ww rule", "ww guide", "ww help"],
    description: "Werewolf Game Reference Documentation",
    version: "2.0.0",
    execute: async (m, { args, reply }) => {
        reply("Ini adalah dokumen referensi Werewolf.");
    }
};