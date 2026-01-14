<<<<<<< HEAD
module.exports = async function sendCard({
    ryzu,
    from,
    msg,
    text,
    title,
    image,
    target
}) {
    return ryzu.sendMessage(from, {
        text,
        contextInfo: {
            externalAdReply: {
                title,
                body: "Ryzu Bot Multi-Device",
                thumbnailUrl: image || "https://imgur.com/a/1WFRIn8",
                sourceUrl: target
                    ? "https://wa.me/" + target.split('@')[0]
                    : "https://wa.me/0",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: msg });
};
=======
module.exports = async function sendCard({
    ryzu,
    from,
    msg,
    text,
    title,
    image,
    target
}) {
    return ryzu.sendMessage(from, {
        text,
        contextInfo: {
            externalAdReply: {
                title,
                body: "Ryzu Bot Multi-Device",
                thumbnailUrl: image || "https://imgur.com/a/1WFRIn8",
                sourceUrl: target
                    ? "https://wa.me/" + target.split('@')[0]
                    : "https://wa.me/0",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: msg });
};
>>>>>>> 867da6c2ae86083a8435459a145ae4f01677e69d
