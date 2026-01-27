module.exports = async function sendCard({
    ryzu,
    from,
    msg = null,
    text = '',
    title = 'Ryzu Bot',
    body = 'Ryzu Bot Multi-Device',
    image = 'https://files.catbox.moe/cz6tt0.jpg',
    target = null
}) {
    const contextInfo = {
        externalAdReply: {
            title,
            body,
            mediaType: 1,
            thumbnailUrl: image,
            renderLargerThumbnail: true,
            sourceUrl: target
                ? `https://wa.me/${target.split('@')[0]}`
                : 'https://github.com'
        }
    };

    return ryzu.sendMessage(
        from,
        {
            text,
            contextInfo
        },
        msg ? { quoted: msg } : {}
    );
};
