const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createGiveawayEmbed(giveawayName, endTime, numOfWinners, joinersCount = 0) {
    if (isNaN(endTime) || typeof endTime !== 'number') {
        console.error('Invalid endTime in createGiveawayEmbed:', endTime);
        throw new Error('Invalid endTime provided to createGiveawayEmbed');
    }

    const discordTimestamp = `<t:${Math.floor(endTime / 1000)}:R>`;
    
    const embed = new EmbedBuilder()
        .setTitle(`🎉 **Giveaway**: ${giveawayName} 🎉`)
        .setDescription("👇 **Join the giveaway by clicking the button below!** 👇")
        .addFields(
            { name: '🔚 Ends In', value: discordTimestamp, inline: true },
            { name: '🏆 Winners', value: numOfWinners.toString(), inline: true },
            { name: '👥 Joiners', value: joinersCount.toString(), inline: true }
        )
        .setColor(0xFFC0CB)
        .setThumbnail("https://media.discordapp.net/attachments/1179553732497784906/1219443779447292098/pngtree-giveaway-in-text-banner-style-png-image_239181.png?ex=660b5285&is=65f8dd85&hm=e489122def8410fdbef8847cae24e40a9a30125d25c91ecb1833fd6fa7801305&=&format=webp&quality=lossless&width=960&height=540")
        .setFooter({ text: 'Hurry up! The clock is ticking.' })
        .setTimestamp(new Date(endTime));

    const button = new ButtonBuilder()
        .setCustomId('join-giveaway')
        .setLabel('Join Now!')
        .setEmoji('🎁')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    return { embed, row };
}

module.exports = { createGiveawayEmbed };