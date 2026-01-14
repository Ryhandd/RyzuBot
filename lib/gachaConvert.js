// ==============================
// GACHA DUPLICATE → MONEY
// ==============================

const DUPLICATE_MONEY = {
  COMMON: 5000,
  RARE: 10000,
  EPIC: 20000,
  LEGENDARY: 30000,
  LIMITED: 50000
}

function handleGachaItem(user, itemName, rarity) {
  if (!user.money) user.money = 0
  rarity = rarity.toUpperCase()

  // item pertama kali
  if (!user[itemName]) {
    user[itemName] = 1
    return {
      type: "NEW_ITEM",
      message: `🎉 Kamu mendapatkan ${itemName}`
    }
  }

  // duplikat → duit
  const reward = DUPLICATE_MONEY[rarity] || 0
  user.money += reward

  return {
    type: "DUPLICATE_CONVERTED",
    message: `💰 Duplikat ${itemName} → +${reward.toLocaleString()} uang`
  }
}

module.exports = { handleGachaItem }
