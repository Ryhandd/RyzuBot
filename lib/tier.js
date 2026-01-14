<<<<<<< HEAD
module.exports = {
    order: ["stone", "iron", "gold", "diamond", "netherite"],

    next(current) {
        const i = this.order.indexOf(current);
        return i >= 0 && i < this.order.length - 1
            ? this.order[i + 1]
            : null;
    },

    isMax(tier) {
        return tier === "netherite";
    }
};
=======
module.exports = {
    order: ["stone", "iron", "gold", "diamond", "netherite"],

    next(current) {
        const i = this.order.indexOf(current);
        return i >= 0 && i < this.order.length - 1
            ? this.order[i + 1]
            : null;
    },

    isMax(tier) {
        return tier === "netherite";
    }
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
