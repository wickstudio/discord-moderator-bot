const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user.')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(false)),
    async execute(interaction, client) {
        const { commands } = client.getConfig();
        if (!commands.userinfo) {
            await interaction.reply({ content: 'The /userinfo command is currently disabled.', ephemeral: true });
            return;
        }

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id).catch(console.error);

            if (!member) {
                await interaction.reply({ content: 'Could not fetch user data. Please try again later.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Information for ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'Username', value: user.tag, inline: true },
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Server Join Date', value: `<t:${Math.floor(member.joinedAt / 1000)}:F>`, inline: true },
                    { name: 'Account Creation Date', value: `<t:${Math.floor(user.createdAt / 1000)}:F>`, inline: true }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing the userinfo command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};