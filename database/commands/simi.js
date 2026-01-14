module.exports = {
    name: "simi",
    alias: [],
    execute: async ({ reply, args, sender }) => {
        global.simi = global.simi || {}

        if (!args[0])
            return reply("pakai .simi on atau .simi off yaa 😊")

        if (args[0] === "on") {
            global.simi[sender] = true
            return reply("haiii 😊 simi siap nemenin ngobrol ✨")
        }

        if (args[0] === "off") {
            delete global.simi[sender]
            return reply("okee, sampai nanti yaa 👋😊")
        }

        return reply("pilih on atau off aja yaa 😄")
    }
}
