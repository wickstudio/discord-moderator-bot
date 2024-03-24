const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about the server.'),
    async execute(interaction,client) {
        const { commands } =  client.getConfig();
        if (!commands.serverinfo) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        try {
            const { guild } = interaction;
            if (!guild) throw new Error('Guild information is unavailable.');

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Server Information for ${guild.name}`)
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: 'Server Name', value: guild.name, inline: true },
                    { name: 'Server ID', value: guild.id, inline: true },
                    { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
                    { name: 'Creation Date', value: `<t:${Math.floor(guild.createdAt / 1000)}:F>`, inline: true },
                    { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing the serverinfo command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
