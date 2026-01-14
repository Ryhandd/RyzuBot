<<<<<<< HEAD
module.exports = {
    name: "shimi",
    alias: [],
    execute: async ({ reply, args, sender }) => {
        global.shimi = global.shimi || {}

        if (!args[0])
            return reply(".shimi on / off bestiee")

        if (args[0] === "on") {
            global.shimi[sender] = true
            return reply("haloo bestiee🥰🥰")
        }

        if (args[0] === "off") {
            delete global.shimi[sender]
            return reply("bye bye bestiee")
        }

        reply("on / off aja bestiee")
    }
}
=======
module.exports = {
    name: "shimi",
    alias: [],
    execute: async ({ reply, args, sender }) => {
        global.shimi = global.shimi || {}

        if (!args[0])
            return reply(".shimi on / off bestiee")

        if (args[0] === "on") {
            global.shimi[sender] = true
            return reply("haloo bestiee🥰🥰")
        }

        if (args[0] === "off") {
            delete global.shimi[sender]
            return reply("bye bye bestiee")
        }

        reply("on / off aja bestiee")
    }
}
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
