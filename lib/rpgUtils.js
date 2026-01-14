// lib/rpgUtils.js
const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function safeNum(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
}

function addMoney(user, amount) {
    user.money = safeNum(user.money);
    amount = safeNum(amount);

    user.money += amount;

    if (user.money > MAX_SAFE)
        user.money = MAX_SAFE;

    if (user.money < 0)
        user.money = 0;

    return user.money;
}

function addExp(user, amount) {
    user.exp = safeNum(user.exp);
    user.exp += safeNum(amount);
    return user.exp;
}

module.exports = {
    safeNum,
    addMoney,
    addExp,
    MAX_SAFE
};
